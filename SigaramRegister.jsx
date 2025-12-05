import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus } from 'lucide-react';

export default function SigaramRegister() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', imaBranch: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      toast({ title: "Registration Failed", description: authError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (user) {
      const { error: dbError } = await supabase.from('sigaram_participants').insert({
        id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        ima_branch: formData.imaBranch,
        password: formData.password, // Storing password for admin reference; hash in production
      });

      if (dbError) {
        toast({ title: "Database Error", description: dbError.message, variant: "destructive" });
      } else {
        toast({ title: "Registration Successful", description: "Please check your email to confirm your account and then log in." });
        navigate('/sigaram/login');
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Participant Registration</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input name="fullName" placeholder="Full Name" onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
        <input name="imaBranch" placeholder="IMA Branch" onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
        <Button type="submit" disabled={loading} className="w-full">
          <UserPlus className="mr-2 h-4 w-4" /> {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <p className="text-center text-sm mt-6">
        Already have an account? <Link to="/sigaram/login" className="font-medium text-blue-600 hover:underline">Login here</Link>
      </p>
    </div>
  );
}