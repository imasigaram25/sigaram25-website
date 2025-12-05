import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Badge } from '@/components/ui/badge'; 
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Trophy, MapPin, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveStatusTable = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchStatus();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchStatus(true);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            // Fetch events with participant counts
            const { data, error } = await supabase
                .from('sigaram_events')
                .select(`
                    *,
                    sigaram_event_participants (count)
                `)
                .order('event_time', { ascending: true });

            if (error) throw error;

            // Check for published results
            const eventsWithResults = await Promise.all(data.map(async (ev) => {
                const { count } = await supabase
                    .from('sigaram_scores')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', ev.id)
                    .eq('status', 'Published');
                
                return {
                    ...ev,
                    participant_count: ev.sigaram_event_participants?.[0]?.count || 0,
                    has_results: count > 0
                };
            }));

            setEvents(eventsWithResults);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Error fetching live status:", err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'ongoing': return 'bg-green-100 text-green-700 border-green-200 animate-pulse';
            case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    const handleViewResults = (eventId) => {
        navigate(`/sigaram/results?event_id=${eventId}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600"/> Live Event Status
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time updates from the venue. Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchStatus()} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}/> Refresh
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b">
                        <tr>
                            <th className="px-6 py-4">Event Name</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Participants</th>
                            <th className="px-6 py-4 text-center">Results</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {events.map((ev) => (
                            <tr key={ev.id} className={`hover:bg-gray-50 transition-colors ${ev.status === 'Ongoing' ? 'bg-green-50/30' : ''}`}>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {ev.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-gray-400"/> {ev.location || 'TBD'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{new Date(ev.event_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        {ev.revised_time && (
                                            <span className="text-xs text-red-500 font-bold">Rev: {ev.revised_time}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ev.status)}`}>
                                        {ev.status || 'Upcoming'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-mono text-gray-600">
                                    {ev.participant_count}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {ev.has_results ? (
                                        <Button 
                                            size="sm" 
                                            className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                                            onClick={() => handleViewResults(ev.id)}
                                        >
                                            <Trophy className="w-3 h-3 mr-1"/> View Results
                                        </Button>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Not Published</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                                    No events scheduled for today.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LiveStatusTable;