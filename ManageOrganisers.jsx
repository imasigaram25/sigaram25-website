
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus, Trash2, Mail, Phone, RefreshCw, Wand2, Eye, EyeOff, Lock, Shield } from 'lucide-react';

const ManageOrganisers = () => {
    const { toast } = useToast();
    const [organisers, setOrganisers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        rights: {
            attendance: false,
            scoring: false,
            event_management: false
        }
    });

    useEffect(() => {
        fetchOrganisers();
    }, []);

    const fetchOrganisers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sigaram_profiles')
                .select('*')
                .eq('role', 'organizer')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrganisers(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast({ title: "Error", description: "Failed to load organisers", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password: pass }));
        setShowPassword(true); // Show the generated password
    };

    const handleRightChange = (right) => {
        setFormData(prev => ({
            ...prev,
            rights: {
                ...prev.rights,
                [right]: !prev.rights[right]
            }
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            toast({ title: "Validation Error", description: "Name, Email and Password are required.", variant: "destructive" });
            return;
        }

        if (formData.password.length < 8) {
            toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
            return;
        }

        setCreating(true);

        // Convert rights object to array for storage
        const rightsArray = Object.keys(formData.rights).filter(key => formData.rights[key]);

        try {
            const { data, error } = await supabase.functions.invoke('create-judge-organizer', {
                body: {
                    full_name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    rights: rightsArray
                }
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.error || "Unknown error");

            toast({ 
                title: "Success", 
                description: `Organizer created for ${formData.email}`,
                className: "bg-green-50 border-green-200 text-green-900"
            });
            
            setFormData({ 
                name: '', email: '', phone: '', password: '', 
                rights: { attendance: false, scoring: false, event_management: false } 
            });
            setShowPassword(false);
            fetchOrganisers();

        } catch (err) {
            console.error("Creation failed:", err);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this organizer? This action cannot be undone.")) return;

        try {
            // First delete from auth (requires Edge Function usually, but we can delete profile and let cascade or trigger handle it, 
            // or manually delete profile and assume auth cleanup happens elsewhere. 
            // For strictness, we should use admin API, but here we just delete profile from DB)
            const { error } = await supabase.from('sigaram_profiles').delete().eq('id', id);
            if (error) throw error;

            toast({ title: "Organizer Removed" });
            setOrganisers(prev => prev.filter(o => o.id !== id));
        } catch (err) {
            toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8">
            {/* Create Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Add New Organizer</h3>
                        <p className="text-sm text-gray-500">Create account with specific permissions</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Full Name <span className="text-red-500">*</span></label>
                            <Input 
                                placeholder="Name" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Email <span className="text-red-500">*</span></label>
                            <Input 
                                type="email" 
                                placeholder="Email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Phone</label>
                            <Input 
                                placeholder="Phone (Optional)" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold uppercase text-gray-500">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Password" 
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                                <button 
                                    type="button"
                                    tabIndex="-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                         <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Access Rights & Permissions</label>
                         <div className="flex flex-wrap gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="right_attendance" 
                                    checked={formData.rights.attendance}
                                    onCheckedChange={() => handleRightChange('attendance')}
                                />
                                <label htmlFor="right_attendance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Mark Attendance
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="right_scoring" 
                                    checked={formData.rights.scoring}
                                    onCheckedChange={() => handleRightChange('scoring')}
                                />
                                <label htmlFor="right_scoring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Enter Marks (Scoring)
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="right_mgmt" 
                                    checked={formData.rights.event_management}
                                    onCheckedChange={() => handleRightChange('event_management')}
                                />
                                <label htmlFor="right_mgmt" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Event Management (Slots/Status)
                                </label>
                            </div>
                         </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={generatePassword} className="px-4">
                            <Wand2 className="w-4 h-4 mr-2 text-blue-600"/> Generate Password
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[150px]" disabled={creating}>
                            {creating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2"/>}
                            {creating ? "Creating..." : "Create Organizer"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Active Organisers</h3>
                    <Button variant="ghost" size="sm" onClick={fetchOrganisers} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
                    </Button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Rights</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && organisers.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500"/></td></tr>
                            ) : organisers.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">No organizers found.</td></tr>
                            ) : (
                                organisers.map((org) => (
                                    <tr key={org.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{org.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-2 text-gray-600"><Mail className="w-3 h-3"/> {org.email}</span>
                                                {org.phone && <span className="flex items-center gap-2 text-gray-500 text-xs"><Phone className="w-3 h-3"/> {org.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(org.rights) && org.rights.length > 0 ? (
                                                    org.rights.map(r => (
                                                        <span key={r} className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                                            {r.replace('_', ' ')}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No specific rights</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(org.id)}
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageOrganisers;
