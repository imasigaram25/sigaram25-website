import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Facebook, Twitter, Instagram, Linkedin, Stethoscope, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Subscribed!",
      description: "We'll notify you when we launch.",
      className: "bg-blue-50 text-blue-900 border-blue-200"
    });
    setEmail('');
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-slate-900">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80" 
          alt="Medical Background" 
          className="w-full h-full object-cover opacity-30"
         src="https://images.unsplash.com/photo-1694327875183-a71ba0c061a4" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-blue-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl">
            <Stethoscope className="w-12 h-12 text-blue-400" />
          </div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-blue-400 font-semibold tracking-widest uppercase text-sm mb-4"
        >
          Indian Medical Association - Hosur
        </motion.h2>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
        >
          Coming Soon
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          We are building a new digital experience for our medical community. 
          Stay tuned for the launch of the official IMA Hosur website.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16"
        >
           {/* Subscription Form */}
          <form onSubmit={handleSubscribe} className="flex w-full max-w-sm items-center space-x-2 bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-sm">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-transparent border-none text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" size="sm" className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-6">
              Notify Me
            </Button>
          </form>
        </motion.div>

        {/* Event Portal Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-12"
        >
          <div className="inline-block p-[1px] rounded-2xl bg-gradient-to-r from-transparent via-blue-500/50 to-transparent">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
                <h3 className="text-white font-bold mb-2">Looking for Sigaram 2025?</h3>
                <p className="text-sm text-gray-400 mb-4">The event portal is live and active for registrations and results.</p>
                <Button 
                  onClick={() => navigate('/sigaram')}
                  className="w-full bg-white text-slate-900 hover:bg-gray-200 font-bold"
                >
                  Go to Event Portal <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer/Social */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center gap-6 text-gray-400"
        >
          <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
        </motion.div>
        
        <div className="absolute bottom-6 text-xs text-gray-600">
          &copy; 2025 Indian Medical Association, Hosur Branch. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;