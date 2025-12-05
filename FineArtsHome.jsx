import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
    Trophy, 
    Calendar, 
    MapPin, 
    Clock, 
    Users, 
    Music, 
    Mic2, 
    Palette, 
    BookOpen, 
    Video, 
    Phone,
    QrCode,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

// Countdown Timer Component
const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isStarted: false
    });

    useEffect(() => {
        // Target Date: December 7th, 2025 at 8:00 AM
        const targetDate = new Date('2025-12-07T08:00:00');

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true });
                clearInterval(interval);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isStarted: false });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (timeLeft.isStarted) {
        return (
            <div className="animate-pulse bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-4 rounded-full font-black text-2xl shadow-[0_0_30px_rgba(220,38,38,0.6)] border-2 border-yellow-400">
                EVENT STARTED!
            </div>
        );
    }

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center mx-2 md:mx-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 w-16 md:w-24 h-20 md:h-24 flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl md:text-4xl font-black text-white font-mono">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-blue-200 font-semibold">{label}</span>
        </div>
    );

    return (
        <div className="flex flex-wrap justify-center items-center mt-8 mb-4">
            <TimeUnit value={timeLeft.days} label="Days" />
            <span className="text-2xl md:text-4xl font-light text-yellow-400 mb-8">:</span>
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <span className="text-2xl md:text-4xl font-light text-yellow-400 mb-8">:</span>
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <span className="text-2xl md:text-4xl font-light text-yellow-400 mb-8">:</span>
            <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
    );
};

const SigaramHome = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">
            
            {/* HERO SECTION */}
            <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-blue-900 to-indigo-900 overflow-hidden pt-32 pb-20">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                {/* Decorative Glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-[150px] opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
                    
                    {/* IMA LOGO HEADER - Made more visible */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center mb-6 md:mb-10"
                    >
                        <h3 className="text-yellow-400 text-base md:text-xl lg:text-2xl uppercase tracking-[0.3em] font-bold mb-2 text-shadow-lg">IMA Hosur Proudly Presents</h3>
                        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>
                    </motion.div>

                    {/* MAIN TITLE */}
                    <motion.h1 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-400 mb-4 drop-shadow-2xl tracking-tighter leading-none"
                    >
                        SIGARAM
                        <span className="text-red-500 ml-2 md:ml-4">2025</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-2xl md:text-4xl text-yellow-400 font-serif italic mb-10 font-bold drop-shadow-lg"
                    >
                        "Champion of Champions!"
                    </motion.p>

                    {/* EVENT DETAILS BADGES */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap justify-center gap-4 mb-12"
                    >
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white shadow-lg hover:bg-white/20 transition-colors">
                            <Calendar className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold tracking-wide">7.12.2025</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white shadow-lg hover:bg-white/20 transition-colors">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold tracking-wide">8:00 AM</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white shadow-lg hover:bg-white/20 transition-colors">
                            <MapPin className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold tracking-wide">Meera Mahal, Hosur</span>
                        </div>
                    </motion.div>

                    {/* COUNTDOWN */}
                    <motion.div
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 1 }}
                         className="mb-12"
                    >
                        <CountdownTimer />
                    </motion.div>

                    {/* CTA BUTTONS */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-wrap justify-center gap-6"
                    >
                        <Button 
                            size="lg" 
                            onClick={() => navigate('/sigaram/participant-directory')}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 text-lg font-bold px-8 py-6 rounded-full shadow-xl shadow-red-900/30 transition-all hover:scale-105"
                        >
                            <Users className="mr-2 h-5 w-5" /> Participant Directory
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => navigate('/sigaram/results')}
                            className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900 text-lg font-bold px-8 py-6 rounded-full shadow-lg transition-all hover:scale-105"
                        >
                            <Trophy className="mr-2 h-5 w-5" /> Live Results
                        </Button>
                    </motion.div>
                </div>
            </section>


            {/* GUESTS SECTION */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Distinguished Guests</h2>
                        <div className="h-1 w-24 bg-red-600 mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-1 gap-12 max-w-4xl mx-auto">
                        {/* CHIEF GUEST */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow"
                        >
                            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-4 text-center">
                                <h3 className="text-white text-xl font-bold uppercase tracking-widest">Chief Guest</h3>
                            </div>
                            <div className="p-8 text-center">
                                <h4 className="text-3xl font-black text-gray-900 mb-2">Dr. SENGUTTUVAN</h4>
                                <p className="text-blue-600 font-bold text-lg">President IMA TNSB 2025</p>
                            </div>
                        </motion.div>

                        {/* GUESTS OF HONOUR */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Guest of Honour</span>
                                <h4 className="text-xl font-bold text-gray-900">Dr. KARTHIK PRABHU</h4>
                                <p className="text-gray-600 text-sm">Honorary Secretary IMA TNSB 2025</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Guest of Honour</span>
                                <h4 className="text-xl font-bold text-gray-900">Dr. GOWRI SHANKAR</h4>
                                <p className="text-gray-600 text-sm">Honorary Treasurer IMA TNSB 2025</p>
                            </div>
                             <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Chairman, Fine Arts</span>
                                <h4 className="text-xl font-bold text-gray-900">Dr. GNANAMEENAKSHI</h4>
                                <p className="text-gray-600 text-sm">Chairman, Finearts Standing Committee, IMA TNSB 2025</p>
                            </div>
                             <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Advisor</span>
                                <h4 className="text-xl font-bold text-gray-900">Dr. MALLIGA KULANTHASVELU</h4>
                                <p className="text-gray-600 text-sm">Advisor, Finearts Standing Committee, IMA TNSB 2025</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* EVENT CATEGORIES */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gray-50 opacity-50 -skew-y-3 transform origin-top-left scale-110 z-0"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Event Categories</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Showcasing talent across a spectrum of artistic and cultural disciplines.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <CategoryCard 
                            icon={<Music className="w-8 h-8 text-white"/>}
                            title="Music Melodies"
                            color="bg-pink-600"
                            description="Solo & Group singing competitions that celebrate the rhythm of life."
                            coords="Dr. Murali Jayaraman, Dr. Sriramajayam"
                        />
                        <CategoryCard 
                            icon={<Mic2 className="w-8 h-8 text-white"/>}
                            title="Vibrations"
                            color="bg-purple-600"
                            description="Dance performances that bring energy and emotion to the stage."
                            coords="Dr. Rahul, Dr. Pravin"
                        />
                        <CategoryCard 
                            icon={<Palette className="w-8 h-8 text-white"/>}
                            title="Fine Fingerprints"
                            color="bg-orange-500"
                            description="Showcasing artistic excellence through painting and crafts."
                            coords="Dr. Thilak, Dr. Latha"
                        />
                        <CategoryCard 
                            icon={<BookOpen className="w-8 h-8 text-white"/>}
                            title="Literary Events"
                            color="bg-blue-600"
                            description="Debates, poetry, and elocution for the intellectual minds."
                            coords="Dr. Moulidharan, Dr. Kathiravan"
                        />
                        <CategoryCard 
                            icon={<Video className="w-8 h-8 text-white"/>}
                            title="Dumb Charades"
                            color="bg-green-600"
                            description="The ultimate test of acting and non-verbal communication."
                            coords="Dr. Radha Murali, Dr. Prasanth"
                        />
                         <CategoryCard 
                            icon={<Users className="w-8 h-8 text-white"/>}
                            title="Troubleshooting"
                            color="bg-gray-700"
                            description="Dedicated committee to ensure smooth conduct of all events."
                            coords="Dr. Rengaraj, Dr. Murali J"
                        />
                    </div>
                </div>
            </section>


            {/* ORGANIZING COMMITTEE */}
            <section className="py-24 bg-blue-900 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Organizing Team</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="bg-blue-800/50 border border-blue-700 rounded-xl p-6 min-w-[250px]">
                                <h4 className="text-yellow-400 font-bold text-lg mb-1">Hosted By</h4>
                                <div className="text-2xl font-black mb-2">IMA HOSUR</div>
                                <p className="text-blue-200 text-sm">Indian Medical Association</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-2xl bg-blue-800/30 hover:bg-blue-800/50 transition-colors">
                            <h4 className="text-2xl font-bold text-white mb-2">Dr. V. SREENIVASA GOWDA</h4>
                            <p className="text-blue-300 font-medium uppercase tracking-wider text-sm">President, IMA Hosur</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-blue-800/30 hover:bg-blue-800/50 transition-colors">
                            <h4 className="text-2xl font-bold text-white mb-2">Dr. RAHUL RAVINDRAN</h4>
                            <p className="text-blue-300 font-medium uppercase tracking-wider text-sm">Secretary, IMA Hosur</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-blue-800/30 hover:bg-blue-800/50 transition-colors">
                            <h4 className="text-2xl font-bold text-white mb-2">Dr. R. PRAVIN KUMAAR</h4>
                            <p className="text-blue-300 font-medium uppercase tracking-wider text-sm">Finance Secretary, IMA Hosur</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER / CONTACT */}
            <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold mb-6 text-white">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-600 p-3 rounded-lg mt-1">
                                        <Phone className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-200">Event Related Queries</h4>
                                        <p className="text-2xl font-bold text-yellow-400">Dr. Pravin: 9486197588</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-600 p-3 rounded-lg mt-1">
                                        <Phone className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-200">Other Queries</h4>
                                        <p className="text-2xl font-bold text-yellow-400">Dr. Rahul: 8608184847</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl text-slate-900 flex flex-col items-center text-center">
                            <h4 className="text-xl font-bold mb-4">Scan for Location</h4>
                            <div className="border-4 border-slate-900 p-2 rounded-lg mb-4">
                                {/* Placeholder QR Code - In real app replace with actual QR image */}
                                <QrCode className="w-32 h-32 text-slate-900" />
                            </div>
                            <p className="font-semibold text-lg">Meera Mahal</p>
                            <p className="text-sm text-gray-600">50, 2nd Cross Railway Station Rd, Balaji Nagar,<br/>Shanthi Nagar East, Hosur, Tamil Nadu 635109</p>
                            <Button 
                                variant="link" 
                                className="text-blue-600 mt-2 font-bold"
                                onClick={() => window.open('https://maps.google.com/?q=Meera+Mahal+Hosur', '_blank')}
                            >
                                View on Google Maps <ArrowRight className="ml-1 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    
                    <div className="mt-16 pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
                        &copy; 2025 IMA Hosur. All rights reserved. | SIGARAM 2025
                    </div>
                </div>
            </footer>
        </div>
    );
};

const CategoryCard = ({ icon, title, description, color, coords }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden relative"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}></div>
        
        <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
            {icon}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
        
        <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Coordinators</p>
            <p className="text-sm font-medium text-blue-900">{coords}</p>
        </div>
    </motion.div>
);

export default SigaramHome;