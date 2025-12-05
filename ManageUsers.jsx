import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserPlus, Plus, CheckCircle, AlertCircle, RefreshCw, ShieldCheck, KeyRound } from 'lucide-react';

const ManageUsers = ({ roleType }) => {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '' });
    const [isCreating, setIsCreating] = useState(false);
    
    // Debug & Verification States
    const [generatedCreds, setGeneratedCreds] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [isVerifyingLogin, setIsVerifyingLogin] = useState(false);
    const [loginTestResult, setLoginTestResult] = useState(null);

    useEffect(() => {
        fetchUsers();

        const channel = supabase
            .channel(`manage-users-${roleType}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sigaram_profiles', filter: `role=eq.${roleType}` },
                (payload) => {
                    console.log("Real-time update received:", payload);
                    fetchUsers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roleType]);

    const fetchUsers = async () => {
        setLoading(true);
        console.log(`[ManageUsers] Fetching ${roleType}s...`);
        const { data, error } = await supabase
            .from('sigaram_profiles')
            .select('*')
            .eq('role', roleType)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("[ManageUsers] Fetch Error:", error);
            toast({ title: "Fetch Error", description: error.message, variant: "destructive" });
        } else {
            console.log(`[ManageUsers] Fetched ${data?.length || 0} records.`);
            setUsers(data || []);
        }
        setLoading(false);
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
        let pass = '';
        for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setNewUser(prev => ({ ...prev, password: pass }));
    };

    const runAuthDebug = async (email) => {
        console.log(`[Debug] Running diagnostics for ${email}...`);
        try {
            const { data, error } = await supabase.functions.invoke('debug-auth-user', {
                body: { email }
            });
            if (error) throw error;
            console.log("[Debug] Result:", data);
            setDebugInfo(data);
            return data;
        } catch (err) {
            console.error("[Debug] Failed:", err);
            toast({ title: "Debug Failed", description: err.message, variant: "destructive" });
            return null;
        }
    };

    const testUserLogin = async () => {
        if (!generatedCreds) return;
        setIsVerifyingLogin(true);
        setLoginTestResult(null);
        
        try {
            const { data, error } = await supabase.functions.invoke('verify-user-login', {
                body: { email: generatedCreds.email, password: generatedCreds.password }
            });
            
            if (error) throw error;
            console.log("[LoginTest] Result:", data);
            setLoginTestResult(data);
            
            if (data.success) {
                toast({ title: "Login Verified", description: "User can log in successfully.", className: "bg-green-50 border-green-200" });
            } else {
                toast({ title: "Login Failed", description: data.message, variant: "destructive" });
            }

        } catch (err) {
            console.error("[LoginTest] Error:", err);
            toast({ title: "Test Error", description: err.message, variant: "destructive" });
        } finally {
            setIsVerifyingLogin(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setGeneratedCreds(null);
        setDebugInfo(null);
        setLoginTestResult(null);

        try {
            console.log("Invoking Edge Function: create-judge-organizer");
            const { data, error } = await supabase.functions.invoke('create-judge-organizer', {
                body: {
                    email: newUser.email,
                    password: newUser.password,
                    fullName: newUser.fullName,
                    role: roleType
                }
            });

            if (error) throw error;
            if (data && data.error) throw new Error(data.error);

            console.log("Edge Function Success:", data);
            
            // Save credentials for display
            setGeneratedCreds({ email: newUser.email, password: newUser.password });
            
            // Reset Form
            setNewUser({ fullName: '', email: '', password: '' });
            
            toast({ title: "Success", description: `${roleType === 'judge' ? 'Judge' : 'Organizer'} created.` });

            // Run Diagnostics immediately
            await runAuthDebug(data.user?.email || newUser.email);
            fetchUsers();

        } catch (err) {
            console.error("Creation flow error:", err);
            toast({ title: "Error", description: err.message || "Failed to create user", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Form & Diagnostics */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Creation Card */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                        <UserPlus className="w-5 h-5 mr-2 text-blue-600"/> 
                        Add New {roleType === 'judge' ? 'Judge' : 'Organizer'}
                    </h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Full Name</label>
                            <input 
                                required 
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                value={newUser.fullName} 
                                onChange={e => setNewUser({...newUser, fullName: e.target.value})} 
                                placeholder={`Dr. ${roleType === 'judge' ? 'Judge' : 'Organizer'} Name`} 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Email Address</label>
                            <input 
                                required 
                                type="email" 
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                value={newUser.email} 
                                onChange={e => setNewUser({...newUser, email: e.target.value})} 
                                placeholder="email@example.com" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Password</label>
                            <div className="flex gap-2">
                                <input 
                                    required 
                                    className="flex-1 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={newUser.password} 
                                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={generatePassword}>Gen</Button>
                            </div>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isCreating}>
                            {isCreating ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2"/>}
                            {isCreating ? 'Creating...' : 'Create Account'}
                        </Button>
                    </form>
                </div>

                {/* Verification & Credentials Card */}
                <AnimatePresence>
                    {generatedCreds && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-white p-6 rounded-lg border shadow-sm ring-1 ring-green-100"
                        >
                            <div className="flex items-center gap-2 text-green-700 font-bold mb-3">
                                <CheckCircle className="w-5 h-5"/> Account Created
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs font-mono space-y-1 mb-4 select-all">
                                <p><span className="text-gray-500">Email:</span> {generatedCreds.email}</p>
                                <p><span className="text-gray-500">Pass:</span> {generatedCreds.password}</p>
                            </div>

                            {debugInfo && (
                                <div className="mb-4 text-xs space-y-1 border-t pt-2">
                                    <p className="font-bold text-gray-600">Diagnostics:</p>
                                    <div className="flex justify-between">
                                        <span>Auth User:</span> 
                                        <span className={debugInfo.auth_found ? "text-green-600 font-bold" : "text-red-600"}>{debugInfo.auth_found ? "FOUND" : "MISSING"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Profile:</span> 
                                        <span className={debugInfo.profile_found ? "text-green-600 font-bold" : "text-red-600"}>{debugInfo.profile_found ? "FOUND" : "MISSING"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sync Status:</span> 
                                        <span className={debugInfo.match_status === 'SYNCED' ? "text-green-600 font-bold" : "text-red-600"}>{debugInfo.match_status}</span>
                                    </div>
                                    {debugInfo.auth_user && <p className="text-[10px] text-gray-400 mt-1">UID: {debugInfo.auth_user.id}</p>}
                                </div>
                            )}

                            <Button onClick={testUserLogin} disabled={isVerifyingLogin} variant="outline" size="sm" className="w-full">
                                {isVerifyingLogin ? <Loader2 className="animate-spin w-3 h-3 mr-2"/> : <KeyRound className="w-3 h-3 mr-2"/>}
                                Test Login Now
                            </Button>

                            {loginTestResult && (
                                <div className={`mt-3 p-2 rounded text-xs text-center font-bold ${loginTestResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {loginTestResult.success ? "LOGIN SUCCESSFUL" : "LOGIN FAILED"}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-gray-800">Existing {roleType === 'judge' ? 'Judges' : 'Organizers'}</h3>
                     <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={loading}>
                         <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
                     </Button>
                </div>
               
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && users.length === 0 ? (
                                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2"/>Loading...</td></tr>
                            ) : users.length > 0 ? (
                                users.map(u => (
                                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{u.name || u.full_name}</td>
                                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wide ${u.role === 'judge' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button size="sm" variant="ghost" onClick={() => runAuthDebug(u.email)} title="Run Diagnostics">
                                                <ShieldCheck className="w-4 h-4 text-gray-400 hover:text-blue-600"/>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-4 py-12 text-center text-gray-400 italic">No {roleType}s found in the database.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;