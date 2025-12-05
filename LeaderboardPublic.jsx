import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LiveLeaderboard from './components/LiveLeaderboard';
import { supabase } from '@/lib/customSupabaseClient';

const LeaderboardPublic = () => {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('event_id');
    const [eventName, setEventName] = useState('');

    useEffect(() => {
        if (eventId) {
            supabase.from('sigaram_events').select('name').eq('id', eventId).single()
                .then(({ data }) => {
                    if (data) setEventName(data.name);
                });
        }
    }, [eventId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
            <div className="container mx-auto px-4">
                <header className="text-center mb-8">
                    <img src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/2569a48f2b6d4d37c0e55b477559770f.png" alt="Logo" className="h-16 mx-auto mb-4"/>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 uppercase tracking-widest">
                        {eventName || 'Live Leaderboard'}
                    </h1>
                    <p className="text-blue-200 text-lg font-medium tracking-wide">SIGARAM 2025 • OFFICIAL STANDINGS</p>
                </header>
                
                {eventId ? (
                    <LiveLeaderboard defaultEventId={eventId} publicView={true} />
                ) : (
                    <div className="text-center text-white py-20">
                        <h2 className="text-2xl font-bold">Waiting for Event Signal...</h2>
                        <p className="text-gray-400">Please configure the event ID in the display settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPublic;