
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Play, CheckCircle, UserX, Clock, Search, ListOrdered } from 'lucide-react';
import { Card } from '@/components/ui/card';

const EventManagementPortal = () => {
    const { toast } = useToast();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchParticipants(selectedEvent);
            
            // Subscribe to real-time updates for performances
            const channel = supabase
                .channel(`event-performances-${selectedEvent}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'sigaram_event_performances', filter: `event_id=eq.${selectedEvent}` },
                    (payload) => {
                        fetchParticipants(selectedEvent, true); // Silent refresh
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedEvent]);

    const fetchEvents = async () => {
        const { data } = await supabase.from('sigaram_events').select('id, name, event_time, location').order('event_time');
        if (data) setEvents(data);
    };

    const fetchParticipants = async (eventId, silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Fetch participants joined with their performance status
            // Since join syntax in simple client can be tricky with custom tables if FKs aren't auto-detected perfectly by client lib sometimes,
            // we fetch both and merge manually for safety or use a view.
            // Here we use manual merge for robustness.
            
            const { data: parts } = await supabase
                .from('sigaram_event_participants')
                .select('*')
                .eq('event_id', eventId);

            const { data: perfs } = await supabase
                .from('sigaram_event_performances')
                .select('*')
                .eq('event_id', eventId);

            const perfMap = {};
            perfs?.forEach(p => perfMap[p.participant_id] = p);

            const merged = parts?.map(p => ({
                ...p,
                performance: perfMap[p.id] || { status: 'pending', slot_number: null }
            })) || [];

            // Sort by slot number (if exists) or name
            merged.sort((a, b) => {
                const slotA = a.performance.slot_number || 9999;
                const slotB = b.performance.slot_number || 9999;
                return slotA - slotB;
            });

            setParticipants(merged);

        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const updateStatus = async (participantId, status) => {
        setActionLoading(participantId);
        try {
            const { error } = await supabase
                .from('sigaram_event_performances')
                .upsert({
                    event_id: selectedEvent,
                    participant_id: participantId,
                    status: status
                }, { onConflict: 'event_id, participant_id' });

            if (error) throw error;
            toast({ title: "Status Updated", description: `Marked as ${status}` });
            fetchParticipants(selectedEvent, true);

        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    const assignSlot = async (participantId, slot) => {
        if (!slot) return;
        try {
            const { error } = await supabase
                .from('sigaram_event_performances')
                .upsert({
                    event_id: selectedEvent,
                    participant_id: participantId,
                    slot_number: parseInt(slot)
                }, { onConflict: 'event_id, participant_id' });
            
            if (error) throw error;
            fetchParticipants(selectedEvent, true);
        } catch (err) {
            toast({ title: "Error", description: "Failed to assign slot", variant: "destructive" });
        }
    };

    const currentPerformer = participants.find(p => p.performance.status === 'performing');
    const completedList = participants.filter(p => p.performance.status === 'completed');
    const pendingList = participants.filter(p => p.performance.status === 'pending');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Select Event</label>
                    <select 
                        className="w-full border rounded p-2"
                        value={selectedEvent}
                        onChange={e => setSelectedEvent(e.target.value)}
                    >
                        <option value="">-- Choose Event --</option>
                        {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                {selectedEvent && (
                     <div className="text-sm text-gray-500 text-right">
                        <p><span className="font-bold">Location:</span> {events.find(e => e.id === selectedEvent)?.location || 'TBD'}</p>
                        <p><span className="font-bold">Time:</span> {events.find(e => e.id === selectedEvent)?.event_time}</p>
                     </div>
                )}
            </div>

            {selectedEvent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Current Performance */}
                    <div className="lg:col-span-3">
                        <Card className="p-6 bg-blue-50 border-blue-200">
                            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                                <Play className="w-5 h-5 mr-2 fill-blue-600 text-blue-600"/> Current Performance
                            </h3>
                            {currentPerformer ? (
                                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">{currentPerformer.name}</h2>
                                        <p className="text-gray-500 font-medium">{currentPerformer.team_name}</p>
                                        <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                            Slot #{currentPerformer.performance.slot_number || 'NA'}
                                        </span>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex gap-3">
                                        <Button 
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => updateStatus(currentPerformer.id, 'completed')}
                                            disabled={actionLoading === currentPerformer.id}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2"/> Mark Completed
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 italic bg-white rounded-xl border border-dashed">
                                    No participant currently performing.
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Upcoming / Participant List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <ListOrdered className="w-5 h-5 mr-2"/> Participant Queue
                            </h3>
                            {loading ? <Loader2 className="animate-spin mx-auto"/> : (
                                <div className="space-y-2">
                                    {pendingList.length === 0 && <p className="text-gray-400 italic text-center py-4">No pending participants.</p>}
                                    {pendingList.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                                            <div className="flex items-center gap-3">
                                                <Input 
                                                    type="number" 
                                                    placeholder="#" 
                                                    className="w-12 h-8 text-center p-1"
                                                    defaultValue={p.performance.slot_number}
                                                    onBlur={(e) => assignSlot(p.id, e.target.value)}
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{p.name}</p>
                                                    <p className="text-xs text-gray-500">{p.team_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" 
                                                    onClick={() => updateStatus(p.id, 'performing')}
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8"
                                                    disabled={!!currentPerformer} // Disable if someone is performing
                                                >
                                                    <Play className="w-3 h-3 mr-1"/> Start
                                                </Button>
                                                <Button size="sm" variant="ghost" 
                                                    onClick={() => updateStatus(p.id, 'absent')}
                                                    className="text-red-500 hover:text-red-700 h-8"
                                                >
                                                    <UserX className="w-3 h-3"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completed List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-4 rounded-xl shadow-sm border h-full">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-green-600"/> Completed
                            </h3>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                {completedList.length === 0 && <p className="text-gray-400 italic text-center">No completed performances.</p>}
                                {completedList.map(p => (
                                    <div key={p.id} className="p-3 bg-gray-50 rounded border opacity-75 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-xs text-gray-700">{p.name}</p>
                                            <span className="text-[10px] bg-gray-200 px-1 rounded">Slot {p.performance.slot_number}</span>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => updateStatus(p.id, 'pending')} title="Undo">
                                            <Clock className="w-3 h-3 text-gray-400"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManagementPortal;
