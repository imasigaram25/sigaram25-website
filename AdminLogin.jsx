import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Shield, LogIn, Loader2, Wrench } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { clearAllSessions } from '@/lib/authUtils';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.role === 'admin') {
         navigate('/admin/dashboard', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Error", description: "Please enter both email and password." });
      return;
    }

    setLoading(true);

    try {
      await clearAllSessions();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user data returned.");

      // Check Role
      const role = data.user.user_metadata?.role;
      if (role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Access Denied: This account does not have Administrator privileges.");
      }

      // Store role for client-side checks
      localStorage.setItem('user_role', 'admin');

      toast({
        title: "Access Granted",
        description: "Welcome back, Administrator.",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Login Error:", err);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: err.message === "Invalid login credentials" 
          ? "Invalid email or password." 
          : err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Dev Tool to create/reset the admin user using the Edge Function
  const handleInitializeAdmin = async () => {
    setInitializing(true);
    try {
      const { data, error } = await supabase.functions.invoke('upsert-admin');
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Failed to create admin user");
      }

      toast({
        title: "System Initialized",
        description: "Admin user created/reset successfully. You can now login.",
        className: "bg-blue-50 border-blue-200 text-blue-900"
      });
      
      // Pre-fill for convenience
      setEmail('admin@imahosur.com');
      setPassword('Sigaram@25');

    } catch (err) {
      console.error("Initialization Error:", err);
      toast({
        variant: "destructive",
        title: "Initialization Failed",
        description: err.message || "Could not create admin user."
      });
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-800 relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-4 rounded-full mb-4 shadow-lg shadow-blue-900/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-2">Secure Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email Address</label>
            <Input 
              type="email" 
              placeholder="admin@imahosur.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gray-900 hover:bg-black text-lg font-bold transition-all mt-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-3">System Management</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleInitializeAdmin}
            disabled={initializing || loading}
            className="w-full text-xs text-gray-500 hover:text-gray-900 border-dashed"
          >
            {initializing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wrench className="w-3 h-3 mr-2" />}
            {initializing ? 'Creating User...' : 'Reset/Create Admin User'}
          </Button>
        </div>
      </div>
    </div>
  );
}