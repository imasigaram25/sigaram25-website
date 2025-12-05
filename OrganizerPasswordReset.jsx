
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function OrganizerPasswordReset() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
        return;
    }

    if (newPassword.length < 8) {
        toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 8 characters" });
        return;
    }

    setLoading(true);
    try {
        const { data, error } = await supabase.functions.invoke('reset-organizer-password', {
            body: { email, new_password: newPassword }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        toast({ 
            title: "Success", 
            description: "Password has been reset successfully. Please login.", 
            className: "bg-green-50 text-green-900"
        });
        navigate('/sigaram/organizer-login');

    } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Reset Failed", description: err.message || "Something went wrong" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <Link to="/sigaram/organizer-login" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-1"/> Back to Login
        </Link>
        
        <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-500 text-sm">Enter your email and new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    placeholder="Enter your registered email"
                />
            </div>

            <div className="space-y-2 relative">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                    <Input 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        required
                        placeholder="Min 8 characters"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required
                    placeholder="Re-enter new password"
                />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : null}
                {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </form>
      </div>
    </div>
  );
}
