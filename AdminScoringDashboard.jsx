
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lock, Globe, CheckCircle, AlertTriangle, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const AdminScoringDashboard = () => {
    const { toast } = useToast();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [branchScores, setBranchScores] = useState([]);
    const [participantsData, setParticipantsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resultsStatus, setResultsStatus] = useState('pending'); // pending | approved | released
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchEventData(selectedEvent);
        } else {
            setBranchScores([]);
            setParticipantsData([]);
            setResultsStatus('pending');
        }
    }, [selectedEvent]);

    const fetchEvents = async () => {
        const { data } = await supabase.from('sigaram_events').select('id, name').order('name');
        if (data) setEvents(data);
    };

    const fetchEventData = async (eventId) => {
        setLoading(true);
        try {
            // 1. Check Approval Status
            const { data: approval } = await supabase
                .from('sigaram_results_approval')
                .select('status')
                .eq('event_id', eventId)
                .single();
            
            setResultsStatus(approval?.status || 'pending');

            // 2. Fetch Scores & Participants
            const { data: parts } = await supabase
                .from('sigaram_event_participants')
                .select('id, name, ima_branch, team_name')
                .eq('event_id', eventId);

            const { data: scores } = await supabase
                .from('sigaram_scores')
                .select('participant_id, score, rank, points')
                .eq('event_id', eventId);

            // Process Data for Branch Ranking
            const branchMap = {};
            const allParticipants = [];

            parts?.forEach(p => {
                const branch = p.ima_branch || 'Unknown';
                if (!branchMap[branch]) {
                    branchMap[branch] = { branchName: branch, totalPoints: 0, participants: [] };
                }
                
                const s = scores?.find(sc => sc.participant_id === p.id);
                const mark = Number(s?.score || 0);
                const points = Number(s?.points || 0);
                const rank = s?.rank || '-';
                
                branchMap[branch].totalPoints += points; // Sum of points (10, 7, 5 etc)
                branchMap[branch].participants.push({ name: p.name, mark, rank, points });
                
                allParticipants.push({
                    ...p,
                    mark,
                    rank,
                    points
                });
            });

            // Sort branches by total points
            const sortedBranches = Object.values(branchMap).sort((a, b) => b.totalPoints - a.totalPoints);
            let rank = 1;
            sortedBranches.forEach((b, i) => {
                if (i > 0 && b.totalPoints < sortedBranches[i-1].totalPoints) rank = i + 1;
                b.rank = rank;
            });

            setBranchScores(sortedBranches);
            
            // Sort participants by rank
            allParticipants.sort((a, b) => {
                if (a.rank === '-') return 1;
                if (b.rank === '-') return -1;
                return a.rank - b.rank;
            });
            setParticipantsData(allParticipants);

        } catch (err) {
            console.error(err);
            toast({ title: "Error fetching data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseResults = async () => {
        try {
            const { error } = await supabase
                .from('sigaram_results_approval')
                .upsert({
                    event_id: selectedEvent,
                    status: 'released',
                    released_at: new Date().toISOString(),
                    approved_by: 'Admin'
                }, { onConflict: 'event_id' });

            if (error) throw error;

            toast({ title: "Success", description: "Results Released to Public!" });
            setResultsStatus('released');
            setConfirmOpen(false);
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">Scoring & Results Admin</h2>
                <select 
                    className="border p-2 rounded min-w-[250px]"
                    value={selectedEvent}
                    onChange={e => setSelectedEvent(e.target.value)}
                >
                    <option value="">Select Event to Review</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>

            {selectedEvent && (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Participant List with Scores */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Individual Rankings</h3>
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                                resultsStatus === 'released' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {resultsStatus}
                            </span>
                        </div>
                        <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 font-bold text-gray-600 border-b sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Rank</th>
                                        <th className="px-4 py-2">Participant</th>
                                        <th className="px-4 py-2">Marks</th>
                                        <th className="px-4 py-2">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {participantsData.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold text-center w-16">
                                                {p.rank !== '-' && p.rank <= 3 ? (
                                                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white mx-auto
                                                        ${p.rank === 1 ? 'bg-yellow-500' : p.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                                                        {p.rank}
                                                     </div>
                                                ) : (
                                                    <span className="text-gray-400">{p.rank}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.team_name}</p>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-blue-600">{p.mark}</td>
                                            <td className="px-4 py-3 font-bold text-green-600">+{p.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Branch Rankings */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
                         <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-600"/> Branch Standings
                            </h3>
                            {resultsStatus !== 'released' && (
                                <Button 
                                    size="sm"
                                    onClick={() => setConfirmOpen(true)} 
                                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                                >
                                    <Globe className="w-3 h-3 mr-1"/> Release Results
                                </Button>
                            )}
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 font-bold text-gray-600 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Rank</th>
                                        <th className="px-6 py-3">Branch</th>
                                        <th className="px-6 py-3 text-right">Total Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {branchScores.map((branch) => (
                                        <tr key={branch.branchName} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                                                    ${branch.rank === 1 ? 'bg-yellow-500' : branch.rank === 2 ? 'bg-gray-400' : branch.rank === 3 ? 'bg-orange-400' : 'bg-gray-200 text-gray-600'}`}>
                                                    {branch.rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{branch.branchName}</td>
                                            <td className="px-6 py-4 font-black text-blue-600 text-lg text-right">{branch.totalPoints}</td>
                                        </tr>
                                    ))}
                                    {branchScores.length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">No scores recorded yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600"><AlertTriangle className="w-5 h-5 mr-2"/> Confirm Release</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to release the results for <strong>{events.find(e=>e.id===selectedEvent)?.name}</strong>?
                            <br/><br/>
                            Once released, results will be visible to the public immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleReleaseResults} className="bg-red-600 hover:bg-red-700">Yes, Release Results</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminScoringDashboard;
