import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, MapPin, Clock, Users, Zap, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveEventTracker = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLiveEvents();

        // Real-time subscription
        const channel = supabase
            .channel('live-tracker-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sigaram_live_events_tracker' },
                (payload) => {
                    console.log("Live Tracker Update:", payload);
                    fetchLiveEvents(); // Refetch full details on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchLiveEvents = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('get-live-events');
            if (error) throw error;
            if (data && data.halls) {
                setHalls(data.halls);
            }
        } catch (err) {
            console.error("Error fetching live events:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-gray-500 font-medium">Loading live hall status...</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {halls.map((hall) => (
                <motion.div 
                    key={hall.hall_number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: hall.hall_number * 0.1 }}
                    className="flex flex-col h-full"
                >
                    {/* Hall Header */}
                    <div className="bg-gray-900 text-white p-3 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold text-sm tracking-wide">HALL {hall.hall_number}</h3>
                        <div className="flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-mono uppercase text-red-300 ml-1">LIVE</span>
                        </div>
                    </div>

                    {/* Current Event Card */}
                    <div className={`bg-white border-x border-b p-4 flex-1 flex flex-col relative overflow-hidden ${!hall.current_event ? 'bg-gray-50' : ''}`}>
                        {hall.current_event ? (
                            <>
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 mb-2">
                                        {hall.current_event.category || 'Event'}
                                    </span>
                                    <h4 className="text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
                                        {hall.current_event.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3"/> 
                                        Started: {new Date(hall.current_event.revised_time || hall.current_event.event_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </p>
                                </div>

                                <div className="mt-auto pt-3 border-t border-dashed border-gray-200">
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                        <span className="font-semibold flex items-center"><Users className="w-3 h-3 mr-1"/> Participants</span>
                                        <span className="bg-gray-100 px-1.5 rounded font-mono">{hall.current_event.participant_count || 0}</span>
                                    </div>
                                    {hall.current_event.top_participants && hall.current_event.top_participants.length > 0 && (
                                        <div className="text-xs text-gray-500 space-y-1">
                                            {hall.current_event.top_participants.map((p, idx) => (
                                                <div key={idx} className="truncate pl-2 border-l-2 border-blue-200">{p.name}</div>
                                            ))}
                                            {hall.current_event.participant_count > 3 && <div className="pl-2 text-[10px] italic text-gray-400">+ {hall.current_event.participant_count - 3} others</div>}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6 opacity-50">
                                <Zap className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="text-sm font-medium text-gray-400">No event currently live</p>
                            </div>
                        )}
                    </div>

                    {/* Next Up Section */}
                    <div className="bg-gray-50 border-x border-b rounded-b-xl p-3">
                         <h5 className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center">
                            Next Up <ArrowRight className="w-3 h-3 ml-1"/>
                         </h5>
                         {hall.next_event ? (
                             <div>
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{hall.next_event.name}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center">
                                    <Clock className="w-3 h-3 mr-1"/>
                                    {new Date(hall.next_event.revised_time || hall.next_event.event_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </p>
                             </div>
                         ) : (
                             <p className="text-xs text-gray-400 italic">Schedule clear</p>
                         )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default LiveEventTracker;