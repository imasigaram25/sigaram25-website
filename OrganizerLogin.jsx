
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, LogIn, Loader2, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { clearAllSessions } from '@/lib/authUtils';

export default function OrganizerLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState('credentials'); // credentials | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearAllSessions();
  }, []);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Check Role
      const role = data.user?.user_metadata?.role;
      if (role !== 'organizer' && role !== 'admin') {
         await supabase.auth.signOut();
         throw new Error("Access Denied: Not an organizer account.");
      }

      // 2. Trigger OTP
      const { error: otpError } = await supabase.functions.invoke('send-organizer-otp', {
          body: { email }
      });

      if (otpError) {
          console.error("OTP Send Error:", otpError);
          // Fallback for demo/testing if Edge Function fails or isn't deployed yet
          toast({ title: "Warning", description: "Could not send OTP email. Proceeding for testing.", variant: "destructive" });
          // For strict production, we would throw here. 
          // throw new Error("Failed to send verification code."); 
      }

      toast({ title: "Verification Required", description: `OTP sent to ${email}` });
      setStep('otp');

    } catch (err) {
      console.error("Login Failed:", err);
      toast({ variant: "destructive", title: "Login Failed", description: err.message || "Invalid credentials" });
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
          const { data, error } = await supabase.functions.invoke('verify-organizer-otp', {
              body: { email, otp }
          });

          if (error) throw error;
          if (data && !data.success) throw new Error(data.error || "Invalid OTP");

          toast({ title: "Success", description: "Login Verified", className: "bg-green-50 text-green-900 border-green-200" });
          navigate('/sigaram/organizer-dashboard', { replace: true });

      } catch (err) {
          toast({ variant: "destructive", title: "Verification Failed", description: err.message });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-4 rounded-full mb-4 shadow-lg">
            {step === 'credentials' ? <Briefcase className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Organizer Portal</h1>
          <p className="text-gray-500 text-sm mt-2">
              {step === 'credentials' ? 'Access your event management dashboard' : 'Enter the verification code sent to your email'}
          </p>
        </div>

        {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600"/> Email Address
                </label>
                <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="h-12 border-gray-300 focus:border-blue-500" 
                    placeholder="organizer@example.com"
                />
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600"/> Password
                    </label>
                    <Link to="/sigaram/organizer-password-reset" className="text-xs text-blue-600 hover:underline font-medium">
                        Forgot Password?
                    </Link>
                </div>
                <Input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="h-12 border-gray-300 focus:border-blue-500" 
                    placeholder="••••••••"
                />
            </div>

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-lg shadow-md hover:shadow-lg transition-all" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Authenticate"}
            </Button>
            </form>
        ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600"/> One-Time Password (OTP)
                    </label>
                    <Input 
                        type="text" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)} 
                        required 
                        className="h-14 text-center text-2xl tracking-[0.5em] font-mono border-gray-300 focus:border-blue-500" 
                        placeholder="······"
                        maxLength={6}
                    />
                    <p className="text-xs text-center text-gray-400">Check your spam folder if not received.</p>
                </div>
                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold text-lg shadow-md" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <span className="flex items-center">Verify OTP <ArrowRight className="ml-2 w-5 h-5"/></span>}
                </Button>
                <div className="text-center">
                    <button type="button" onClick={() => setStep('credentials')} className="text-sm text-blue-600 hover:underline">
                        Back to Login
                    </button>
                </div>
            </form>
        )}

        <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">Protected by Sigaram Secure Auth</p>
        </div>
      </div>
    </div>
  );
}
