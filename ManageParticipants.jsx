
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import BulkUploadParticipants from './BulkUploadParticipants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Search, Edit, Trash2, Loader2, RefreshCw, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"; 

const ManageParticipants = () => {
  const { toast } = useToast();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Events for dropdown
  const [events, setEvents] = useState([]);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    event_id: '',
    ima_branch: '',
    team_name: '',
    mobile: '',
    participant_type: 'Individual' // Default
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const { data: pData, error: pError } = await supabase
            .from('sigaram_event_participants')
            .select(`*, sigaram_events ( id, name )`)
            .order('created_at', { ascending: false });
        
        if (pError) throw pError;
        setParticipants(pData || []);
        setSelectedIds([]); // Reset selection on refresh

        const { data: eData } = await supabase.from('sigaram_events').select('id, name').order('name');
        setEvents(eData || []);
    } catch (err) {
        console.error("Fetch error:", err);
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const handleAddOpen = () => {
    setFormData({ name: '', event_id: '', ima_branch: '', team_name: '', mobile: '', participant_type: 'Individual' });
    setIsAddOpen(true);
  };

  const handleEditOpen = (p) => {
    setCurrentParticipant(p);
    setFormData({
        name: p.name,
        event_id: p.event_id,
        ima_branch: p.ima_branch,
        team_name: p.team_name,
        mobile: p.mobile || '',
        participant_type: p.participant_type || 'Individual'
    });
    setIsEditOpen(true);
  };

  const handleSubmit = async (mode) => {
     if (!formData.name || !formData.event_id || !formData.ima_branch) {
         toast({ title: "Missing fields", description: "Name, Event, and Branch are required.", variant: "destructive" });
         return;
     }

     setSubmitting(true);
     try {
        const payload = {
            name: formData.name,
            event_id: formData.event_id,
            ima_branch: formData.ima_branch,
            team_name: formData.team_name || formData.name,
            mobile: formData.mobile,
            participant_type: formData.participant_type,
            details: { manual_entry: true, updated_at: new Date().toISOString() }
        };

        if (mode === 'create') {
            const { error } = await supabase.from('sigaram_event_participants').insert(payload);
            if (error) throw error;
            toast({ title: "Success", description: "Participant added." });
            setIsAddOpen(false);
        } else {
            const { error } = await supabase.from('sigaram_event_participants').update(payload).eq('id', currentParticipant.id);
            if (error) throw error;
            toast({ title: "Success", description: "Participant updated." });
            setIsEditOpen(false);
        }
        fetchData();
     } catch (err) {
         toast({ title: "Error", description: err.message, variant: "destructive" });
     } finally {
         setSubmitting(false);
     }
  };

  // Multi-Delete Logic
  const toggleSelect = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredParticipants.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredParticipants.map(p => p.id));
      }
  };

  const handleDeleteSelected = async () => {
      if (selectedIds.length === 0) return;
      if (!window.confirm(`Delete ${selectedIds.length} participants?`)) return;

      try {
          const { error } = await supabase.from('sigaram_event_participants').delete().in('id', selectedIds);
          if (error) throw error;
          
          toast({ title: "Deleted", description: `${selectedIds.length} participants removed.` });
          fetchData();
      } catch (err) {
          toast({ title: "Error", description: err.message, variant: "destructive" });
      }
  };

  const handleDeleteSingle = async (id) => {
      if (!window.confirm("Delete this participant?")) return;
      try {
          const { error } = await supabase.from('sigaram_event_participants').delete().eq('id', id);
          if (error) throw error;
          fetchData();
          toast({ title: "Deleted" });
      } catch (err) {
          toast({ title: "Error", description: err.message });
      }
  };

  const filteredParticipants = participants.filter(p => 
     p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.sigaram_events?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.ima_branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
         <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2 text-gray-700"><Users className="w-5 h-5 text-blue-600" /> Bulk Actions</CardTitle></CardHeader>
         <CardContent><BulkUploadParticipants /></CardContent>
      </Card>

      <Card>
         <CardHeader className="flex flex-row items-center justify-between">
             <div><CardTitle>All Participants</CardTitle><CardDescription>Manage individual registrations</CardDescription></div>
             <div className="flex gap-2">
                 {selectedIds.length > 0 && (
                     <Button variant="destructive" onClick={handleDeleteSelected}>
                         <Trash2 className="w-4 h-4 mr-2"/> Delete Selected ({selectedIds.length})
                     </Button>
                 )}
                 <Button onClick={handleAddOpen} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2"/> Add Participant</Button>
             </div>
         </CardHeader>
         <CardContent>
             <div className="flex justify-between items-center mb-4 gap-4">
                 <div className="relative flex-1 max-w-sm">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                     <Input placeholder="Search participants..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                 </div>
                 <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/></Button>
             </div>

             <div className="rounded-md border overflow-hidden">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs border-b">
                         <tr>
                             <th className="px-4 py-3 w-[50px]">
                                 <Checkbox 
                                     checked={filteredParticipants.length > 0 && selectedIds.length === filteredParticipants.length}
                                     onCheckedChange={toggleSelectAll}
                                 />
                             </th>
                             <th className="px-4 py-3">Name</th>
                             <th className="px-4 py-3">Type</th>
                             <th className="px-4 py-3">Event</th>
                             <th className="px-4 py-3">Branch / Team</th>
                             <th className="px-4 py-3 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y">
                         {loading ? (
                             <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr>
                         ) : filteredParticipants.length === 0 ? (
                             <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No participants found.</td></tr>
                         ) : (
                             filteredParticipants.map(p => (
                                 <tr key={p.id} className={`hover:bg-gray-50 ${selectedIds.includes(p.id) ? 'bg-blue-50' : ''}`}>
                                     <td className="px-4 py-3">
                                         <Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                                     </td>
                                     <td className="px-4 py-3 font-medium">{p.name}</td>
                                     <td className="px-4 py-3">
                                         <span className={`text-xs font-bold px-2 py-1 rounded ${p.participant_type === 'Group' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                             {p.participant_type || 'Individual'}
                                         </span>
                                     </td>
                                     <td className="px-4 py-3">{p.sigaram_events?.name || 'Unknown'}</td>
                                     <td className="px-4 py-3">
                                         <div className="text-gray-900">{p.ima_branch}</div>
                                         <div className="text-xs text-gray-500">{p.team_name}</div>
                                     </td>
                                     <td className="px-4 py-3 text-right flex justify-end gap-2">
                                         <Button variant="ghost" size="sm" onClick={() => handleEditOpen(p)}><Edit className="w-4 h-4 text-blue-600"/></Button>
                                         <Button variant="ghost" size="sm" onClick={() => handleDeleteSingle(p.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
         </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
          <DialogContent>
              <DialogHeader><DialogTitle>{isAddOpen ? 'Add Participant' : 'Edit Participant'}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Participant Name</Label>
                          <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Type</Label>
                          <select 
                             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                             value={formData.participant_type}
                             onChange={e => setFormData({...formData, participant_type: e.target.value})}
                          >
                             <option value="Individual">Individual</option>
                             <option value="Group">Group</option>
                          </select>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label>Event</Label>
                      <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={formData.event_id}
                          onChange={e => setFormData({...formData, event_id: e.target.value})}
                      >
                          <option value="">Select Event...</option>
                          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Branch</Label>
                          <Input value={formData.ima_branch} onChange={e => setFormData({...formData, ima_branch: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Team Name (Optional)</Label>
                          <Input value={formData.team_name} onChange={e => setFormData({...formData, team_name: e.target.value})} />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label>Contact Number</Label>
                      <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
                  <Button onClick={() => handleSubmit(isAddOpen ? 'create' : 'update')} disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>} Save
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageParticipants;
