import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
    Loader2, Save, Search, UserCheck, UserX, Clock, Users 
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AttendanceMarking = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filterTerm, setFilterTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [attendanceState, setAttendanceState] = useState({}); 

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchParticipantsAndAttendance(selectedEvent);
        } else {
            setParticipants([]);
            setAttendanceState({});
        }
    }, [selectedEvent]);

    const fetchEvents = async () => {
        const { data } = await supabase
            .from('sigaram_events')
            .select('id, name, event_time')
            .order('event_time', { ascending: true });
        if (data) setEvents(data);
    };

    const fetchParticipantsAndAttendance = async (eventId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('get-attendance-report', {
                body: { event_id: eventId }
            });

            if (error) throw error;
            
            if (data.success) {
                setParticipants(data.report);
                const initialState = {};
                data.report.forEach(p => {
                    if (p.status !== 'Pending') {
                        initialState[p.participant_id] = p.status;
                    }
                });
                setAttendanceState(initialState);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast({ title: "Error", description: "Failed to load participant list.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (participantId, status) => {
        setAttendanceState(prev => ({
            ...prev,
            [participantId]: status
        }));
    };

    const markAll = (status) => {
        const newState = { ...attendanceState };
        filteredParticipants.forEach(p => {
            newState[p.participant_id] = status;
        });
        setAttendanceState(newState);
    };

    const saveAttendance = async () => {
        if (!selectedEvent) return;
        setSaving(true);

        try {
            const payload = Object.entries(attendanceState).map(([pid, status]) => ({
                participant_id: pid,
                status: status
            }));

            if (payload.length === 0) {
                toast({ title: "No Changes", description: "No attendance statuses to save." });
                setSaving(false);
                return;
            }

            const { data, error } = await supabase.functions.invoke('mark-attendance', {
                body: {
                    event_id: selectedEvent,
                    organizer_id: user?.id,
                    attendance_data: payload
                }
            });

            if (error) throw error;

            if (data.success) {
                toast({ title: "Success", description: "Attendance saved successfully." });
                fetchParticipantsAndAttendance(selectedEvent);
            } else {
                throw new Error(data.error || "Unknown error");
            }

        } catch (err) {
            console.error("Save error:", err);
            toast({ title: "Save Failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const filteredParticipants = participants.filter(p => {
        const matchesSearch = (p.name?.toLowerCase().includes(filterTerm.toLowerCase()) || 
                               p.team_name?.toLowerCase().includes(filterTerm.toLowerCase()) ||
                               p.ima_branch?.toLowerCase().includes(filterTerm.toLowerCase()));
        
        const currentStatus = attendanceState[p.participant_id] || 'Pending';
        const matchesStatus = statusFilter === 'All' || 
                              (statusFilter === 'Pending' ? !attendanceState[p.participant_id] : currentStatus === statusFilter);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Select Event</label>
                    <select 
                        className="w-full border rounded-lg p-2.5 text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedEvent}
                        onChange={e => setSelectedEvent(e.target.value)}
                    >
                        <option value="">-- Choose Event to Mark --</option>
                        {events.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedEvent ? (
                <div className="bg-white rounded-xl shadow-sm border min-h-[400px]">
                    <div className="p-4 border-b flex flex-col md:flex-row justify-between gap-4 bg-gray-50 rounded-t-xl">
                        <div className="flex gap-2 flex-1">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                <Input 
                                    placeholder="Search team, branch or name..." 
                                    className="pl-9 bg-white"
                                    value={filterTerm}
                                    onChange={e => setFilterTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="border rounded-md px-3 bg-white text-sm"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => markAll('Present')} className="text-green-700 hover:text-green-800 hover:bg-green-50">
                                <UserCheck className="w-4 h-4 mr-2"/> All Present
                            </Button>
                            <Button size="sm" onClick={saveAttendance} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs border-b">
                                <tr>
                                    <th className="px-6 py-3">Team Name</th>
                                    <th className="px-6 py-3">Branch</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Participant</th>
                                    <th className="px-6 py-3 text-center">Mark</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500"/></td></tr>
                                ) : filteredParticipants.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-gray-400 italic">No participants found matching filters.</td></tr>
                                ) : (
                                    filteredParticipants.map((p) => {
                                        const currentStatus = attendanceState[p.participant_id];
                                        return (
                                            <tr key={p.participant_id} className={`hover:bg-gray-50 transition-colors ${currentStatus === 'Present' ? 'bg-green-50/30' : currentStatus === 'Absent' ? 'bg-red-50/30' : ''}`}>
                                                <td className="px-6 py-4 font-bold text-blue-800">{p.team_name || '-'}</td>
                                                <td className="px-6 py-4 font-medium">{p.ima_branch || '-'}</td>
                                                <td className="px-6 py-4 text-gray-500">{p.event_type || 'Individual'}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900 text-base">{p.name}</p>
                                                    {p.mobile && <p className="text-gray-400 text-xs mt-0.5">{p.mobile}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleStatusChange(p.participant_id, 'Present')}
                                                            className={`flex items-center gap-1 px-3 py-2 rounded border transition-all ${currentStatus === 'Present' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 hover:bg-green-50'}`}
                                                        >
                                                            <UserCheck className="w-4 h-4"/> Present
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(p.participant_id, 'Absent')}
                                                            className={`flex items-center gap-1 px-3 py-2 rounded border transition-all ${currentStatus === 'Absent' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 hover:bg-red-50'}`}
                                                        >
                                                            <UserX className="w-4 h-4"/> Absent
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {p.status !== 'Pending' ? (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border
                                                            ${p.status === 'Present' ? 'bg-green-100 text-green-800 border-green-200' : 
                                                              'bg-red-100 text-red-800 border-red-200'}`}>
                                                            {p.status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic">Not Marked</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center h-64">
                    <Users className="w-8 h-8 text-gray-300 mb-4"/>
                    <h3 className="text-lg font-bold text-gray-900">Ready to Mark Attendance</h3>
                    <p className="text-gray-500">Select an event from the dropdown above to begin.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceMarking;