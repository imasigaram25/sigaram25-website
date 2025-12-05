import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Trophy, Medal } from 'lucide-react';

const LiveLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('get-live-leaderboard');
            if (error) throw error;
            if (data.success) {
                setLeaderboard(data.leaderboard);
            }
        } catch (err) {
            console.error("Leaderboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 text-white shadow-lg">
                <h2 className="text-3xl font-black flex items-center gap-3">
                    <Trophy className="text-yellow-400 w-8 h-8"/> Live Leaderboard
                </h2>
                <p className="text-purple-200 mt-2">Top performing teams across all events</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-10 h-10 text-purple-600"/></div>
            ) : (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs border-b">
                            <tr>
                                <th className="px-6 py-4 text-center w-24">Rank</th>
                                <th className="px-6 py-4">Team Name</th>
                                <th className="px-6 py-4">Branch</th>
                                <th className="px-6 py-4 text-center">Events</th>
                                <th className="px-6 py-4 text-right">Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaderboard.map((team, idx) => (
                                <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-sm
                                            ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                                              idx === 1 ? 'bg-gray-300 text-gray-800' : 
                                              idx === 2 ? 'bg-orange-300 text-orange-900' : 
                                              'bg-gray-100 text-gray-500'}`}>
                                            {idx + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 text-lg">{team.team_name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        {team.ima_branch || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">
                                            {team.events_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-2xl text-indigo-600">
                                        {team.total_score}
                                    </td>
                                </tr>
                            ))}
                            {leaderboard.length === 0 && (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No scores recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LiveLeaderboard;