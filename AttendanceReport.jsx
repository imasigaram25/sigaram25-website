import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, FileText, Filter, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/card';

const AttendanceReport = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [reportData, setReportData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const loadEvents = async () => {
            const { data } = await supabase
                .from('sigaram_events')
                .select('id, name')
                .order('event_time', { ascending: true });
            if (data) setEvents(data);
        };
        loadEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchReport(selectedEvent);
        } else {
            setReportData([]);
            setStats(null);
        }
    }, [selectedEvent]);

    const fetchReport = async (eventId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('get-attendance-report', {
                body: { event_id: eventId }
            });
            if (error) throw error;
            if (data.success) {
                setReportData(data.report);
                setStats(data.stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (reportData.length === 0) return;

        const headers = ["Participant Name", "Mobile", "Location", "Team", "Status", "Check-In Time", "Marked By"];
        const rows = reportData.map(r => [
            r.name,
            r.mobile,
            r.location,
            r.team_name,
            r.status,
            r.check_in_time ? new Date(r.check_in_time).toLocaleString() : '-',
            r.marked_by
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + 
            headers.join(",") + "\n" + 
            rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const filteredData = reportData.filter(r => 
        filterStatus === 'All' || r.status === filterStatus
    );

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row gap-4 justify-between items-end bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-full md:w-1/2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600"/> Attendance Reports
                    </h2>
                    <select 
                        className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        value={selectedEvent}
                        onChange={e => setSelectedEvent(e.target.value)}
                    >
                        <option value="">-- Select Event to View Report --</option>
                        {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                {selectedEvent && (
                    <Button onClick={downloadCSV} variant="outline" className="w-full md:w-auto">
                        <Download className="w-4 h-4 mr-2"/> Export to CSV
                    </Button>
                )}
            </div>

            {selectedEvent && stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 border-l-4 border-blue-500 bg-blue-50">
                        <p className="text-xs font-bold text-blue-600 uppercase">Total Participants</p>
                        <p className="text-2xl font-black text-blue-900">{stats.total}</p>
                    </Card>
                    <Card className="p-4 border-l-4 border-green-500 bg-green-50">
                        <p className="text-xs font-bold text-green-600 uppercase">Present</p>
                        <p className="text-2xl font-black text-green-900">{stats.present}</p>
                    </Card>
                    <Card className="p-4 border-l-4 border-red-500 bg-red-50">
                        <p className="text-xs font-bold text-red-600 uppercase">Absent</p>
                        <p className="text-2xl font-black text-red-900">{stats.absent}</p>
                    </Card>
                    <Card className="p-4 border-l-4 border-gray-500 bg-gray-50">
                        <p className="text-xs font-bold text-gray-600 uppercase">Attendance Rate</p>
                        <p className="text-2xl font-black text-gray-900">{stats.percentage}%</p>
                    </Card>
                </div>
            )}

            {selectedEvent && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Detailed Log</h3>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400"/>
                            <select 
                                className="text-sm border rounded px-2 py-1"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Participant</th>
                                    <th className="px-6 py-3">Location / Team</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3">Check-In Time</th>
                                    <th className="px-6 py-3">Marked By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-blue-500"/></td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No records found.</td></tr>
                                ) : (
                                    filteredData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-900">
                                                {row.name}
                                                <div className="text-xs text-gray-400 font-normal">{row.mobile}</div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {row.location}
                                                {row.team_name && <div className="text-xs text-blue-500">{row.team_name}</div>}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold
                                                    ${row.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                      row.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                      row.status === 'Late' ? 'bg-orange-100 text-orange-800' : 
                                                      'bg-gray-100 text-gray-500'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-500">
                                                {row.check_in_time ? new Date(row.check_in_time).toLocaleString() : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 text-xs">
                                                {row.marked_by}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;