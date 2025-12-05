import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Plus, Trash2, Users, User, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AddParticipantDetails = ({ eventFormat, onAdd, onCancel }) => {
    const { toast } = useToast();
    const [teamName, setTeamName] = useState('');
    const [imaBranch, setImaBranch] = useState('');
    const [eventType, setEventType] = useState(eventFormat === 'group' ? 'Group' : 'Individual');
    const [members, setMembers] = useState([]);

    // Initialize members based on format
    useEffect(() => {
        if (eventFormat === 'single') {
            setMembers([{ id: 1, name: '', email: '', mobile: '' }]);
            setEventType('Individual');
        } else if (eventFormat === 'double') {
            setMembers([
                { id: 1, name: '', email: '', mobile: '' },
                { id: 2, name: '', email: '', mobile: '' }
            ]);
            setEventType('Group'); // Treat double as group for simple logic or keep as 'Group' type
        } else {
            // Group/Team default 1
            setMembers([{ id: Date.now(), name: '', email: '', mobile: '' }]);
            setEventType('Group');
        }
    }, [eventFormat]);

    const updateMember = (idx, field, value) => {
        const newMembers = [...members];
        newMembers[idx][field] = value;
        setMembers(newMembers);
    };

    const addMember = () => {
        setMembers([...members, { id: Date.now(), name: '', email: '', mobile: '' }]);
    };

    const removeMember = (idx) => {
        if (members.length <= 1) return;
        const newMembers = [...members];
        newMembers.splice(idx, 1);
        setMembers(newMembers);
    };

    const handleSubmit = () => {
        console.log("[AddParticipantDetails] Validating submission...");

        // 1. Validate Mandatory Fields
        if (!teamName.trim()) {
            toast({ title: "Validation Error", description: "Team Name is required.", variant: "destructive" });
            return;
        }
        if (!imaBranch.trim()) {
             toast({ title: "Validation Error", description: "IMA Branch Name is required.", variant: "destructive" });
             return;
        }
        if (!eventType) {
             toast({ title: "Validation Error", description: "Event Type (Individual/Group) is required.", variant: "destructive" });
             return;
        }

        // 2. Validate Members
        const validMembers = members.filter(m => m.name.trim() !== '');
        if (validMembers.length === 0) {
            toast({ title: "Validation Error", description: "At least one participant name is required.", variant: "destructive" });
            return;
        }
        
        // 3. Data Clean-up
        const cleanedMembers = validMembers.map(m => ({
            ...m,
            name: m.name.trim(),
            email: m.email ? m.email.trim() : '',
            mobile: m.mobile ? String(m.mobile).trim() : '',
            id: (typeof m.id === 'string' && m.id.length > 10) ? m.id : undefined 
        }));

        const payload = {
            team_name: teamName.trim(),
            ima_branch: imaBranch.trim(),
            event_type: eventType,
            members: cleanedMembers
        };

        console.log("[AddParticipantDetails] Emitting payload to parent:", payload);

        // 4. Format for Parent
        onAdd(payload);

        // Reset
        setTeamName('');
        // We keep IMA Branch if needed or clear it? User usually enters multiple for same branch, but let's clear to be safe.
        setImaBranch(''); 
        
        if (eventFormat === 'group') {
             setMembers([{ id: Date.now(), name: '', email: '', mobile: '' }]);
        } else if (eventFormat === 'single') {
             setMembers([{ id: 1, name: '', email: '', mobile: '' }]);
        } else { 
             setMembers([{ id: 1, name: '', email: '', mobile: '' }, { id: 2, name: '', email: '', mobile: '' }]);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg border-b pb-2">
                <UserPlus className="w-5 h-5 text-blue-600"/>
                <h3>Add New Participant Entry</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Mandatory Team Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Team Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. The Avengers"
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                    />
                </div>

                {/* Mandatory Branch */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. Hosur, Krishnagiri"
                        value={imaBranch}
                        onChange={e => setImaBranch(e.target.value)}
                    />
                </div>

                {/* Mandatory Event Type */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Event Type <span className="text-red-500">*</span>
                    </label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={eventType}
                        onChange={e => setEventType(e.target.value)}
                    >
                        <option value="Individual">Individual</option>
                        <option value="Group">Group</option>
                    </select>
                </div>
            </div>

            {/* Members List */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-gray-700">Participant List</label>
                     <span className="text-xs text-gray-500">Add all members for this entry</span>
                </div>
               
                {members.map((member, idx) => (
                    <div key={member.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded border shadow-sm">
                        <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}.</span>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                            <input 
                                className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                placeholder="Participant Name *"
                                value={member.name}
                                onChange={e => updateMember(idx, 'name', e.target.value)}
                            />
                            <input 
                                className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                placeholder="Email (Optional)"
                                value={member.email}
                                onChange={e => updateMember(idx, 'email', e.target.value)}
                            />
                            <input 
                                className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                placeholder="Mobile (Optional)"
                                value={member.mobile}
                                onChange={e => updateMember(idx, 'mobile', e.target.value)}
                            />
                        </div>
                        {(eventFormat === 'group' || members.length > 1) && (
                            <Button variant="ghost" size="icon" onClick={() => removeMember(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        )}
                    </div>
                ))}

                {/* Add Button for Group */}
                {(eventFormat === 'group' || eventType === 'Group') && (
                    <Button type="button" variant="outline" size="sm" onClick={addMember} className="mt-2 border-dashed w-full text-gray-500 hover:text-blue-600">
                        <Plus className="w-4 h-4 mr-2"/> Add Another Member
                    </Button>
                )}
            </div>

            <div className="pt-6 flex gap-3 justify-end">
                <Button variant="ghost" onClick={onCancel} className="text-gray-500">Cancel</Button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-md">
                    <Plus className="w-4 h-4 mr-2"/> Add Entry
                </Button>
            </div>
        </div>
    );
};

export default AddParticipantDetails;