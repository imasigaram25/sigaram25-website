
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Users, Loader2, Filter, MapPin, Star, Clock, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const ParticipantDirectory = () => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        fetchParticipants();
    }, []);

    useEffect(() => {
        filterData();
    }, [searchTerm, participants]);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            // Fetch all participants with event details
            const { data, error } = await supabase
                .from('sigaram_event_participants')
                .select(`
                    *,
                    sigaram_events (
                        name,
                        category,
                        event_time,
                        location
                    )
                `);
            
            if (error) throw error;

            // Format data for display - Removed phone number for public view
            const formatted = data.map(p => ({
                id: p.id,
                event_name: p.sigaram_events?.name || 'Unknown Event',
                event_time: p.sigaram_events?.event_time || 'TBA',
                participant_name: p.name,
                team_name: p.team_name || '-',
                branch: p.ima_branch || '-',
                zone: p.details?.zone || p.ima_branch_zone || '-', 
                type: p.participant_type || p.event_type || 'Individual'
            }));

            setParticipants(formatted);
            setFilteredData(formatted);

        } catch (err) {
            console.error("Error fetching directory:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        if (!searchTerm.trim()) {
            setFilteredData(participants);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = participants.filter(p => 
            (p.participant_name && p.participant_name.toLowerCase().includes(lowerTerm)) ||
            (p.branch && p.branch.toLowerCase().includes(lowerTerm)) ||
            (p.event_name && p.event_name.toLowerCase().includes(lowerTerm)) ||
            (p.zone && p.zone.toLowerCase().includes(lowerTerm)) ||
            (p.team_name && p.team_name.toLowerCase().includes(lowerTerm))
        );
        setFilteredData(filtered);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-gray-900 flex items-center justify-center gap-3">
                        <Users className="w-10 h-10 text-blue-600"/>
                        Participant Directory
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Search and browse all registered participants for Sigaram 2025.
                    </p>
                </div>

                {/* Search Card */}
                <Card className="p-6 shadow-lg border-t-4 border-blue-600 bg-white">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <Input 
                            className="pl-12 h-14 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-all"
                            placeholder="Search by Name, Branch, Event, or Zone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <Filter className="w-4 h-4"/>
                        <span>Searching across {participants.length} records</span>
                    </div>
                </Card>

                {/* Results Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4"/>
                            <p className="text-gray-500 font-medium">Loading Directory...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
                            <p className="text-gray-500">
                                We couldn't find any participants matching "{searchTerm}".
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-bold tracking-wider border-b">
                                        <th className="px-6 py-4">Event Details</th>
                                        <th className="px-6 py-4">Participant / Team</th>
                                        <th className="px-6 py-4">Branch & Zone</th>
                                        <th className="px-6 py-4">Timing</th>
                                        <th className="px-6 py-4 text-center">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.map((row) => (
                                        <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-sm">{row.event_name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-blue-700 text-base">{row.participant_name}</span>
                                                    {row.team_name !== '-' && row.team_name !== row.participant_name && (
                                                        <span className="text-xs text-gray-500 font-medium mt-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit">
                                                            Team: {row.team_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                                        <MapPin className="w-3 h-3 text-red-500"/> {row.branch}
                                                    </span>
                                                    {row.zone !== '-' && (
                                                        <span className="text-xs text-gray-400 pl-5">Zone: {row.zone}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-mono text-gray-600">
                                                    <Clock className="w-3 h-3 text-orange-500"/>
                                                    {row.event_time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border
                                                    ${row.type === 'Group' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                                      'bg-green-50 text-green-700 border-green-100'}`}>
                                                    {row.type === 'Group' ? <Users className="w-3 h-3"/> : <Star className="w-3 h-3"/>}
                                                    {row.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                <div className="text-center text-xs text-gray-400 mt-8">
                    Showing {filteredData.length} of {participants.length} total records
                </div>
            </div>
        </div>
    );
};

export default ParticipantDirectory;
