
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Pencil, MapPin, Clock, FileSpreadsheet } from 'lucide-react';
import BulkUploadEvents from './BulkUploadEvents'; // Assuming this component exists or needs to be toggled

const ManageEvents = () => {
    const { toast } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for creating/editing
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isNewEventOpen, setIsNewEventOpen] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    
    const [editingEvent, setEditingEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({ name: '', event_time: '', location: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sigaram_events')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to load events.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the event and all associated participants.")) return;
        
        try {
            const { error } = await supabase.from('sigaram_events').delete().eq('id', id);
            if (error) throw error;
            
            setEvents(prev => prev.filter(e => e.id !== id));
            toast({ title: "Event deleted" });
        } catch (err) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    const openEdit = (event) => {
        setEditingEvent({ ...event });
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingEvent.name || !editingEvent.event_time) {
             toast({ title: "Validation Error", description: "Event Name and Time are required.", variant: "destructive" });
             return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('sigaram_events')
                .update({
                    name: editingEvent.name,
                    event_time: editingEvent.event_time,
                    location: editingEvent.location
                })
                .eq('id', editingEvent.id);

            if (error) throw error;

            setEvents(prev => prev.map(e => e.id === editingEvent.id ? editingEvent : e));
            toast({ title: "Success", description: "Event details updated." });
            setIsEditOpen(false);
        } catch (err) {
            console.error(err);
            toast({ title: "Update failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEvent.name || !newEvent.event_time) {
             toast({ title: "Validation Error", description: "Event Name and Time are required.", variant: "destructive" });
             return;
        }

        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('sigaram_events')
                .insert([{
                    name: newEvent.name,
                    event_time: newEvent.event_time,
                    location: newEvent.location,
                    category: 'General', // Default category
                    is_fine_arts_event: true
                }])
                .select()
                .single();

            if (error) throw error;

            setEvents(prev => [data, ...prev]);
            toast({ title: "Success", description: "New event created." });
            setNewEvent({ name: '', event_time: '', location: '' });
            setIsNewEventOpen(false);
        } catch (err) {
            console.error(err);
            toast({ title: "Creation failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">All Events</h3>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => setShowBulkUpload(!showBulkUpload)}
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2"/> {showBulkUpload ? 'Hide Upload' : 'Bulk Upload'}
                    </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setIsNewEventOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2"/> New Event
                    </Button>
                </div>
            </div>

            {showBulkUpload && (
                <div className="mb-6">
                    <BulkUploadEvents onUploadComplete={() => {
                        fetchEvents();
                        setShowBulkUpload(false);
                    }} />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500"/></div>
            ) : events.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500">No events found. Create one to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map(event => (
                        <div key={event.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 text-lg">{event.name}</h4>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {event.event_time}</span>
                                    {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {event.location}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-center">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => openEdit(event)}
                                >
                                    <Pencil className="w-4 h-4"/>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(event.id)}
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create New Event Modal */}
            <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 z-50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create New Event</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new-name" className="text-gray-700 font-semibold">Event Name</Label>
                            <Input
                                id="new-name"
                                value={newEvent.name}
                                onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                                className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
                                placeholder="e.g. Solo Singing"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-time" className="text-gray-700 font-semibold">Time</Label>
                            <Input
                                id="new-time"
                                value={newEvent.event_time}
                                onChange={(e) => setNewEvent({...newEvent, event_time: e.target.value})}
                                className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
                                placeholder="e.g. 10:00 AM"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-location" className="text-gray-700 font-semibold">Location</Label>
                            <Input
                                id="new-location"
                                value={newEvent.location || ''}
                                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
                                placeholder="e.g. Main Hall"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewEventOpen(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">Cancel</Button>
                        <Button onClick={handleCreateEvent} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Event Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 z-50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Event Details</DialogTitle>
                    </DialogHeader>
                    
                    {editingEvent && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name" className="text-gray-700 font-semibold">Event Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingEvent.name}
                                    onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                                    className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-time" className="text-gray-700 font-semibold">Time</Label>
                                <Input
                                    id="edit-time"
                                    value={editingEvent.event_time}
                                    onChange={(e) => setEditingEvent({...editingEvent, event_time: e.target.value})}
                                    className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-location" className="text-gray-700 font-semibold">Location</Label>
                                <Input
                                    id="edit-location"
                                    value={editingEvent.location || ''}
                                    onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                                    className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageEvents;
