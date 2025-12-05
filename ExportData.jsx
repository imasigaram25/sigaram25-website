import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Calendar, Users, FileJson } from 'lucide-react';

const ExportData = () => {
    const [loading, setLoading] = useState(false);

    const handleExportParticipants = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sigaram_event_participants')
                .select(`
                    *,
                    sigaram_events (name)
                `);
            
            if (error) throw error;

            // Columns: Team Name, Branch Name, Event Type, Participant Name, Event Name
            const headers = ["Team Name", "Branch Name", "Event Type", "Participant Name", "Event Name", "Mobile"];
            const rows = data.map(row => [
                row.team_name || '-',
                row.ima_branch || '-',
                row.event_type || 'Individual',
                row.name,
                row.sigaram_events?.name || 'Unknown Event',
                row.mobile || '-'
            ]);

            generateCSV(headers, rows, 'sigaram_participants_export');

        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportEvents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('sigaram_events').select('*').order('event_time');
            if (error) throw error;

            // Columns: Event Name, Location, Start Time, End Time, Description
            const headers = ["Event Name", "Location", "Start Time", "End Time", "Description"];
            const rows = data.map(row => [
                row.name,
                row.location,
                new Date(row.event_time).toLocaleTimeString(),
                row.revised_time ? new Date(row.revised_time).toLocaleTimeString() : '-',
                row.description || '-'
            ]);

            generateCSV(headers, rows, 'sigaram_events_export');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportDirectoryJSON = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sigaram_event_participants')
                .select(`
                    name,
                    ima_branch,
                    mobile,
                    ima_branch_zone,
                    event_type,
                    team_name,
                    sigaram_events (name)
                `);
            
            if (error) throw error;

            const formattedData = data.map(p => ({
                "Event": p.sigaram_events?.name || 'Unknown',
                "Name": p.name,
                "Branch": p.ima_branch || '-',
                "Phone": p.mobile || '-',
                "Zone": p.ima_branch_zone || '-',
                "Type": p.event_type || 'Individual'
            }));

            const jsonContent = JSON.stringify(formattedData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "participant_directory_data.json");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("JSON Export failed:", err);
            alert("Failed to export JSON directory.");
        } finally {
            setLoading(false);
        }
    };

    const generateCSV = (headers, rows, filename) => {
        let csvContent = "data:text/csv;charset=utf-8," + 
            headers.join(",") + "\n" + 
            rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n"); // Quote cells to handle commas

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="bg-white p-8 rounded-xl border shadow-sm text-center space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Download complete CSV reports for Events or Participants, or export full directory JSON.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="border p-6 rounded-xl bg-blue-50 border-blue-100 hover:shadow-md transition-shadow">
                    <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-3"/>
                    <h3 className="font-bold text-lg mb-2">Export Events</h3>
                    <p className="text-xs text-gray-500 mb-4">Event Name, Location, Times</p>
                    <Button onClick={handleExportEvents} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                        {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4"/> : <Download className="mr-2 w-4 h-4"/>}
                        CSV
                    </Button>
                </div>

                <div className="border p-6 rounded-xl bg-green-50 border-green-100 hover:shadow-md transition-shadow">
                    <Users className="w-10 h-10 text-green-600 mx-auto mb-3"/>
                    <h3 className="font-bold text-lg mb-2">Export Participants</h3>
                    <p className="text-xs text-gray-500 mb-4">Teams, Branches, Names, Events</p>
                    <Button onClick={handleExportParticipants} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                        {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4"/> : <Download className="mr-2 w-4 h-4"/>}
                        CSV
                    </Button>
                </div>

                <div className="border p-6 rounded-xl bg-purple-50 border-purple-100 hover:shadow-md transition-shadow">
                    <FileJson className="w-10 h-10 text-purple-600 mx-auto mb-3"/>
                    <h3 className="font-bold text-lg mb-2">Participant Directory</h3>
                    <p className="text-xs text-gray-500 mb-4">Full JSON Data Export</p>
                    <Button onClick={handleExportDirectoryJSON} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                        {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4"/> : <Download className="mr-2 w-4 h-4"/>}
                        JSON
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExportData;