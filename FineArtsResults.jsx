
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Trophy, Lock, AlertCircle, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FineArtsResults = () => {
    const [results, setResults] = useState({});
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [releasedEvents, setReleasedEvents] = useState(new Set());

    useEffect(() => {
        fetchResultsData();
    }, []);

    const fetchResultsData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Released Statuses
            const { data: approvals } = await supabase
                .from('sigaram_results_approval')
                .select('event_id')
                .eq('status', 'released');

            const releasedIds = new Set(approvals?.map(a => a.event_id) || []);
            setReleasedEvents(releasedIds);

            // 2. Fetch Events (Only those released)
            if (releasedIds.size === 0) {
                setLoading(false);
                return;
            }

            const { data: allEvents } = await supabase
                .from('sigaram_events')
                .select('*')
                .in('id', Array.from(releasedIds))
                .order('event_time', { ascending: true });
            
            setEvents(allEvents || []);

            if (allEvents && allEvents.length > 0) {
                // 3. Fetch Scores & Participants
                const { data: allScores } = await supabase
                    .from('sigaram_scores')
                    .select('event_id, participant_id, score')
                    .in('event_id', Array.from(releasedIds));

                const { data: participants } = await supabase
                    .from('sigaram_event_participants')
                    .select('id, name, ima_branch, event_id')
                    .in('event_id', Array.from(releasedIds));

                // 4. Process Results (Branch Rankings)
                const resultsMap = {};

                allEvents.forEach(ev => {
                    // Group by branch
                    const branchMap = {};
                    
                    // Filter for this event
                    const eventParts = participants?.filter(p => p.event_id === ev.id) || [];
                    
                    eventParts.forEach(p => {
                        const branch = p.ima_branch || 'Unknown';
                        if (!branchMap[branch]) branchMap[branch] = { branchName: branch, totalScore: 0 };
                        
                        const pScores = allScores?.filter(s => s.participant_id === p.id);
                        const scoreSum = pScores?.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) || 0;
                        
                        branchMap[branch].totalScore += scoreSum;
                    });

                    const sortedBranches = Object.values(branchMap)
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .slice(0, 3)
                        .map((b, i) => ({ ...b, rank: i + 1 }));

                    resultsMap[ev.id] = sortedBranches;
                });

                setResults(resultsMap);
            }

        } catch (err) {
            console.error("Error fetching results:", err);
        } finally {
            setLoading(false);
        }
    };

    const getMedalIcon = (rank) => {
        if (rank === 1) return <div className="bg-yellow-100 p-3 rounded-full shadow-sm"><Trophy className="h-8 w-8 text-yellow-600" /></div>;
        if (rank === 2) return <div className="bg-gray-100 p-3 rounded-full shadow-sm"><Medal className="h-8 w-8 text-gray-500" /></div>;
        if (rank === 3) return <div className="bg-orange-50 p-3 rounded-full shadow-sm"><Medal className="h-8 w-8 text-orange-600" /></div>;
        return null;
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600"/></div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <header className="text-center mb-16">
                    <div className="inline-block bg-white p-4 rounded-full shadow-md mb-4">
                        <Trophy className="h-12 w-12 text-yellow-500"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">SIGARAM 2025 Results</h1>
                    <p className="text-lg text-gray-500">Official Branch Rankings</p>
                </header>
                
                {events.length === 0 ? (
                    <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <Lock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Results Locked</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                           Results are being finalized and will be released shortly.
                        </p>
                        <Button asChild variant="outline"><Link to="/sigaram">Return to Event Home</Link></Button>
                    </div>
                ) : (
                    <div className="grid gap-12 max-w-5xl mx-auto">
                        {events.map(event => {
                            const winners = results[event.id];
                            if (!winners || winners.length === 0) return null;

                            return (
                                <section key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{event.name}</h2>
                                            <span className="text-blue-100 text-xs font-medium uppercase tracking-wider">{event.category}</span>
                                        </div>
                                        <Trophy className="text-white/20 w-12 h-12" />
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {[winners[1], winners[0], winners[2]].map((winner, idx) => {
                                                if (!winner) return <div key={idx} className="hidden md:block"></div>;
                                                
                                                const actualRank = winner.rank; 
                                                const isFirst = actualRank === 1;

                                                return (
                                                    <div key={winner.branchName} className={`flex flex-col items-center text-center ${isFirst ? 'md:-mt-4 order-first md:order-none' : ''}`}>
                                                        <div className={`relative mb-4 ${isFirst ? 'transform scale-110' : ''}`}>
                                                            {getMedalIcon(actualRank)}
                                                            {isFirst && <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">WINNER</div>}
                                                        </div>
                                                        
                                                        <div className="bg-gray-50 w-full rounded-xl p-4 border border-gray-100 relative">
                                                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{winner.branchName}</h3>
                                                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                                                                <span className="font-medium text-gray-400">Total Score</span>
                                                                <span className="font-bold text-blue-600">{winner.totalScore} pts</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FineArtsResults;
