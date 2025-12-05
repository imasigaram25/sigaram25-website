import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Target Date: December 7th, 2025 at 8:00 AM
        const targetDate = new Date('2025-12-07T08:00:00');

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white py-3 shadow-lg border-b border-blue-700">
            <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-widest text-sm md:text-base animate-pulse">
                    <Clock className="w-5 h-5" />
                    <span>Countdown to Sigaram 2025</span>
                </div>
                
                <div className="flex items-center gap-3 md:gap-6 text-center">
                    <div className="flex flex-col">
                        <span className="text-2xl md:text-3xl font-black leading-none font-mono">{timeLeft.days}</span>
                        <span className="text-[10px] uppercase text-blue-200 tracking-wide">Days</span>
                    </div>
                    <span className="text-2xl font-thin text-blue-400 self-start mt-1">:</span>
                    <div className="flex flex-col">
                        <span className="text-2xl md:text-3xl font-black leading-none font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-[10px] uppercase text-blue-200 tracking-wide">Hours</span>
                    </div>
                    <span className="text-2xl font-thin text-blue-400 self-start mt-1">:</span>
                    <div className="flex flex-col">
                        <span className="text-2xl md:text-3xl font-black leading-none font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[10px] uppercase text-blue-200 tracking-wide">Mins</span>
                    </div>
                    <span className="text-2xl font-thin text-blue-400 self-start mt-1">:</span>
                    <div className="flex flex-col">
                        <span className="text-2xl md:text-3xl font-black leading-none font-mono text-yellow-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-[10px] uppercase text-blue-200 tracking-wide">Secs</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;