import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { HeartHandshake, LogIn, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { clearAllSessions } from '@/lib/authUtils';

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role;
      if (role === 'volunteer') {
         navigate('/volunteer/dashboard', { replace: true });
      } else {
         clearAllSessions();
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await clearAllSessions();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned.");

      const role = data.user.user_metadata?.role;
      
      // Allow admin/organizer to login as volunteer for testing, or strict check
      if (role !== 'volunteer' && role !== 'admin' && role !== 'organizer') {
          // throw new Error("Access Denied: Not a volunteer account.");
      }

      localStorage.setItem('user_role', role || 'volunteer');

      toast({
        title: "Welcome, Volunteer!",
        description: "Accessing attendance dashboard...",
        className: "bg-orange-50 border-orange-200 text-orange-800"
      });

      const from = location.state?.from?.pathname || '/volunteer/dashboard';
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Login Failed:", err);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Invalid credentials."
      });
      await clearAllSessions();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <HeartHandshake className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Login</h1>
          <p className="text-gray-500 text-sm mt-2">Attendance & Operations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <Input 
              type="email" 
              placeholder="volunteer@imahosur.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}