import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Lock, Mail, Loader2, RefreshCw, AlertTriangle, CheckCircle2, Info, Bug } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { clearAllSessions } from '@/lib/authUtils';

const SigaramAdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300);
  
  // Fallback OTP state for debugging when email fails
  const [fallbackOtp, setFallbackOtp] = useState(null);

  useEffect(() => {
    // Ensure admin user exists implicitly
    const ensureAdmin = async () => {
         try {
             await supabase.functions.invoke('upsert-admin');
         } catch (e) { /* silent */ }
    };
    ensureAdmin();
  }, []);

  useEffect(() => {
    let interval;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  useEffect(() => {
    let interval;
    if (step === 'otp' && otpExpiry > 0) {
      interval = setInterval(() => setOtpExpiry(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpExpiry]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing Credentials", description: "Please enter both email and password." });
      return;
    }

    setLoading(true);
    setFallbackOtp(null);

    try {
      console.log("🚀 Initiating login for:", email);
      
      const { data, error } = await supabase.functions.invoke('send-admin-otp', {
          body: { email, password }
      });

      if (error) {
          console.error("❌ Edge Function HTTP Error:", error);
          // Try to parse response text if available for more details
          let errMsg = "Server connection failed.";
          try { errMsg = JSON.parse(error.message).error || errMsg; } catch (e) {}
          throw new Error(errMsg);
      }

      // Check functional error inside 200 OK response (if any)
      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.success) {
          throw new Error("Unknown error occurred.");
      }

      // SUCCESS CASE
      console.log("✅ OTP request successful:", data);

      // Check for fallback/debug OTP (if email failed)
      if (data.debug_otp) {
          setFallbackOtp(data.debug_otp);
          toast({
              title: "⚠️ Email Service Issue",
              description: `Could not send email. Use fallback code: ${data.debug_otp}`,
              variant: "destructive",
              duration: 10000,
          });
      } else {
          toast({ 
              title: "OTP Sent", 
              description: `Check your email (${email}) for the code.`,
              className: "bg-blue-50 border-blue-200 text-blue-900"
          });
      }

      setStep('otp');
      setOtpExpiry(300);
      setResendTimer(30);

    } catch (err) {
      console.error("❌ Login Flow Error:", err);
      toast({ 
          variant: "destructive", 
          title: "Login Failed", 
          description: err.message === "Failed to fetch" ? "Network error. Check connection." : err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
      e.preventDefault();
      if (otp.length !== 6) {
          toast({ variant: "destructive", title: "Invalid Format", description: "OTP must be 6 digits." });
          return;
      }

      setLoading(true);
      try {
          // 1. Verify OTP
          const { data, error } = await supabase.functions.invoke('verify-admin-otp', {
              body: { email, otp }
          });

          if (error || !data?.success) {
              throw new Error(data?.error || "Invalid verification code.");
          }

          // 2. Session Establishment
          const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
          });

          if (signInError) {
              console.error("SignIn Error:", signInError);
              throw new Error("OTP correct, but session creation failed.");
          }

          // 3. Redirect
          localStorage.setItem('admin_2fa_verified', 'true');
          localStorage.setItem('admin_2fa_expiry', String(new Date().getTime() + 2 * 60 * 60 * 1000));
          
          toast({ 
              title: "Welcome Back!", 
              description: "Successfully authenticated.",
              className: "bg-green-50 border-green-200 text-green-900"
          });
          
          navigate('/sigaram/admin-dashboard', { replace: true });

      } catch (err) {
          toast({ variant: "destructive", title: "Verification Failed", description: err.message });
      } finally {
          setLoading(false);
      }
  };

  const handleResendOtp = async () => {
      if (resendTimer > 0) return;
      setLoading(true);
      setFallbackOtp(null);
      
      try {
          const { data, error } = await supabase.functions.invoke('send-admin-otp', {
              body: { email, password }
          });
          
          if (error || !data?.success) throw new Error("Failed to resend.");
          
          if (data.debug_otp) {
             setFallbackOtp(data.debug_otp);
             toast({ title: "Debug Code", description: `Use code: ${data.debug_otp}`, variant: "warning" });
          } else {
             toast({ title: "Code Resent", description: "Check your email." });
          }
          
          setResendTimer(30);
          setOtpExpiry(300);
      } catch (err) {
          toast({ variant: "destructive", title: "Error", description: "Could not resend OTP." });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black opacity-80"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-white/10">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md mb-4 border border-white/20 shadow-lg relative z-10">
                 <Shield className="w-8 h-8 text-yellow-400" />
             </div>
             <h1 className="text-2xl font-black text-white tracking-tight relative z-10">Admin Portal</h1>
             <p className="text-blue-200 text-sm mt-1 relative z-10">Sigaram 2025 Management</p>
        </div>

        <div className="p-8">
             {step === 'login' ? (
                 <form onSubmit={handleLogin} className="space-y-5">
                     <div className="space-y-2">
                         <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email Address</label>
                         <div className="relative">
                             <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                             <Input 
                                className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
                                placeholder="admin@imahosur.com" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                             />
                         </div>
                     </div>
                     <div className="space-y-2">
                         <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Password</label>
                         <div className="relative">
                             <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                             <Input 
                                type="password" 
                                className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                             />
                         </div>
                     </div>
                     <Button type="submit" className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-lg font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]" disabled={loading}>
                         {loading ? <Loader2 className="animate-spin" /> : "Authenticate"}
                     </Button>
                     
                     <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                        <Info className="w-3 h-3" />
                        <span>Secure 2FA verification required</span>
                     </div>
                 </form>
             ) : (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="text-center bg-blue-50 p-5 rounded-xl border border-blue-100">
                         <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                         </div>
                         <h3 className="font-bold text-gray-800 text-lg">Check Your Email</h3>
                         <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                             Code sent to <span className="font-medium">{email}</span>
                         </p>
                         
                         {/* DEBUG FALLBACK DISPLAY */}
                         {fallbackOtp && (
                             <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md text-left animate-pulse">
                                 <div className="flex items-center gap-2 text-orange-700 mb-1 font-bold text-xs uppercase tracking-wide">
                                     <Bug className="w-3 h-3" /> Debug Fallback Mode
                                 </div>
                                 <p className="text-xs text-orange-600">
                                     Email failed to send. For testing purposes, here is your code:
                                 </p>
                                 <div className="text-center text-xl font-mono font-bold text-orange-800 mt-1 tracking-widest select-all">
                                     {fallbackOtp}
                                 </div>
                             </div>
                         )}
                     </div>

                     <form onSubmit={handleVerifyOtp} className="space-y-5">
                         <div className="text-center">
                             <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Enter Verification Code</label>
                             <Input 
                                className="h-16 text-center text-3xl tracking-[0.5em] font-mono border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all rounded-xl text-gray-800" 
                                placeholder="000000" 
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                autoFocus
                             />
                         </div>
                         
                         <div className="flex justify-between items-center text-xs px-1 font-medium">
                             <span className={otpExpiry < 60 ? "text-red-500" : "text-gray-500"}>
                                 Expires in {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
                             </span>
                             <button 
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendTimer > 0 || loading}
                                className={`flex items-center gap-1 ${resendTimer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 underline decoration-blue-200'}`}
                             >
                                 <RefreshCw className={`w-3 h-3 ${loading && resendTimer === 0 ? 'animate-spin' : ''}`} />
                                 {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                             </button>
                         </div>

                         <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-bold shadow-lg shadow-green-900/20" disabled={loading}>
                             {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                         </Button>
                     </form>
                     
                     <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-gray-600" onClick={() => setStep('login')}>
                         ← Back to Login
                     </Button>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default SigaramAdminLogin;