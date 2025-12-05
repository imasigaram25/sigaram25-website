import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Calendar, Trophy, User, MapPin, Clock, CheckCircle, AlertCircle, LogOut, RefreshCw, Users, Loader2, ArrowLeft, Search, Eye } from 'lucide-react';

export default function ParticipantDashboard({ isOrganizerView = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for Single Participant View
  const [participantId, setParticipantId] = useState(null);
  const [details, setDetails] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(null);

  // State for Organizer List View
  const [isListView, setIsListView] = useState(isOrganizerView);
  const [participantsList, setParticipantsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (!isOrganizerView) {
        const storedId = localStorage.getItem('sigaram_participant_id');
        const storedSession = localStorage.getItem('sigaram_participant_session');

        if (!storedId && !storedSession) {
            navigate('/sigaram/participant-login');
            return;
        }

        const pId = storedId || (storedSession ? JSON.parse(storedSession).id : null);
        setParticipantId(pId);
        if (pId) fetchDashboardData(pId);
    } else {
        if (isListView) {
            fetchParticipantsList();
        }
    }
  }, [navigate, isOrganizerView]);

  // --- Organizer Functionality ---

  const fetchParticipantsList = async () => {
      setListLoading(true);
      try {
          const { data, error } = await supabase.functions.invoke('get-sync-participants-overview');
          if (error) throw error;
          if (data.success) {
              setParticipantsList(data.data);
          }
      } catch (err) {
          console.error("Failed to fetch participants list:", err);
          toast({ title: "Error", description: "Could not load participants.", variant: "destructive" });
      } finally {
          setListLoading(false);
      }
  };

  const handleViewParticipant = (id) => {
      setParticipantId(id);
      setIsListView(false);
      fetchDashboardData(id);
  };

  const handleBackToList = () => {
      setIsListView(true);
      setParticipantId(null);
      setDetails(null);
      setEvents([]);
  };

  // --- Shared / Detail Functionality ---

  const fetchDashboardData = async (id) => {
      setLoading(true);
      try {
          // 1. Fetch Details
          const { data: detailsData, error: dError } = await supabase.functions.invoke('get-participant-details', {
              body: { participant_id: id }
          });
          if (dError) throw dError;
          if (detailsData.success) setDetails(detailsData.data);

          // 2. Fetch Events
          const { data: eventsData, error: eError } = await supabase.functions.invoke('get-participant-events', {
              body: { participant_id: id }
          });
          if (eError) throw eError;
          if (eventsData.success) {
              // Debug log to verify venue data
              console.log("[ParticipantDashboard] Events loaded:", eventsData.events);
              eventsData.events.forEach(ev => console.log(`Event: ${ev.event_name}, Venue: ${ev.venue}`));
              setEvents(eventsData.events);
          }

      } catch (error) {
          console.error("Dashboard Error:", error);
          toast({ title: "Error loading details", description: "Could not fetch data.", variant: "destructive" });
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = async () => {
      await logout();
      localStorage.removeItem('sigaram_participant_session');
      localStorage.removeItem('sigaram_participant_id');
      navigate('/sigaram/participant-login');
  };

  const markAttendance = async (eventRegId) => {
      if (!isOrganizerView) return; 
      setMarkingAttendance(eventRegId);
      const { error } = await supabase
        .from('sigaram_event_participants')
        .update({ attendance_marked_at: new Date().toISOString() })
        .eq('id', eventRegId);

      if (error) {
          toast({ title: "Error", description: "Failed to mark attendance.", variant: "destructive" });
      } else {
          toast({ title: "Success", description: "Attendance Marked!" });
          setEvents(prev => prev.map(ev => 
              ev.id === eventRegId ? { ...ev, presence: 'Present' } : ev
          ));
      }
      setMarkingAttendance(null);
  };

  // --- RENDER: Organizer List View ---
  if (isOrganizerView && isListView) {
      const filtered = participantsList.filter(p => 
          p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.mobile?.includes(searchTerm)
      );

      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <Users className="text-blue-600"/> Participant Dashboard
                  </h2>
                  <Button variant="outline" size="sm" onClick={fetchParticipantsList}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? 'animate-spin' : ''}`}/> Refresh
                  </Button>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="relative mb-4 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                      <Input 
                          placeholder="Search by name, team, or mobile..." 
                          className="pl-10"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                              <tr>
                                  <th className="px-4 py-3">Participant</th>
                                  <th className="px-4 py-3">Team / Branch</th>
                                  <th className="px-4 py-3 text-center">Events</th>
                                  <th className="px-4 py-3 text-center">Score</th>
                                  <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {listLoading ? (
                                  <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr>
                              ) : filtered.length === 0 ? (
                                  <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No participants found.</td></tr>
                              ) : (
                                  filtered.map(p => (
                                      <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                                          <td className="px-4 py-3">
                                              <div className="font-bold text-gray-900">{p.full_name}</div>
                                              <div className="text-xs text-gray-500 font-mono">{p.mobile}</div>
                                          </td>
                                          <td className="px-4 py-3">
                                              <div className="font-medium text-blue-800">{p.team_name || '-'}</div>
                                              <div className="text-xs text-gray-500">{p.branch}</div>
                                          </td>
                                          <td className="px-4 py-3 text-center">
                                              <span className="bg-gray-100 px-2 py-1 rounded font-bold text-xs">{p.events_registered}</span>
                                          </td>
                                          <td className="px-4 py-3 text-center font-bold text-green-600">
                                              {p.total_score}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                              <Button size="sm" variant="ghost" onClick={() => handleViewParticipant(p.id)} className="hover:bg-blue-100 hover:text-blue-700">
                                                  <Eye className="w-4 h-4 mr-2"/> Details
                                              </Button>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: Detail View (Participant / Single) ---
  
  if (loading) {
      return (
          <div className="min-h-[400px] flex flex-col justify-center items-center bg-gray-50 rounded-xl">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4"/>
              <p className="text-gray-500 font-medium">Loading dashboard data...</p>
          </div>
      );
  }

  return (
    <div className={`${isOrganizerView ? 'bg-white' : 'bg-gray-50 min-h-screen'} pb-12 pt-6`}>
        <div className={`${isOrganizerView ? 'w-full' : 'container mx-auto px-4 max-w-6xl'}`}>
            
            {isOrganizerView && (
                <Button variant="ghost" onClick={handleBackToList} className="mb-4 text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4 mr-2"/> Back to Participant List
                </Button>
            )}

            {/* Header Profile Card */}
            <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border border-blue-100">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <User className="h-10 w-10 text-blue-700"/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">{details?.participant_name}</h2>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600 font-medium">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {details?.branch}</span>
                            <span className="hidden md:inline">•</span>
                            <span>{details?.participant_phone}</span>
                            {details?.team_name && (
                                <>
                                    <span className="hidden md:inline">•</span>
                                    <span className="flex items-center text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                                        <Users className="w-3 h-3 mr-1"/> {details?.team_name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Events</p>
                        <p className="text-2xl font-black text-gray-800">{details?.total_events_registered}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Score</p>
                        <p className="text-2xl font-black text-blue-600">{details?.total_score}</p>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => fetchDashboardData(participantId)} className="text-gray-400 hover:text-blue-600">
                        <RefreshCw className="w-5 h-5"/>
                    </Button>
                    
                    {/* Hide Logout if Organizer View */}
                    {!isOrganizerView && (
                        <Button variant="destructive" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2"/> Logout
                        </Button>
                    )}
                </div>
            </div>
            
            {/* My Events Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-6 h-6 text-blue-600"/>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {isOrganizerView ? "Registered Events & Results" : "My Events"}
                    </h3>
                </div>

                {events.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border-2 border-dashed border-gray-200">
                        <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4"/>
                        <p className="text-gray-500 font-medium">No event registrations found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-gray-600 text-sm font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Event Details</th>
                                        <th className="px-6 py-4">Venue & Time</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Presence</th>
                                        <th className="px-6 py-4 text-center">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {events.map((event) => (
                                        <tr key={event.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{event.event_name}</p>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <p className="flex items-center gap-2 mb-1 text-blue-700 font-medium">
                                                    <MapPin className="w-3 h-3"/> {event.venue}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3"/> {event.event_time}
                                                </p>
                                                {event.revised_time && (
                                                    <p className="text-xs text-red-500 font-bold mt-1">
                                                        (Ends: {event.revised_time})
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                    ${event.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 
                                                      event.status === 'Ongoing' ? 'bg-green-100 text-green-700 animate-pulse' : 
                                                      'bg-gray-100 text-gray-600'}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {event.presence === 'Present' ? (
                                                    <div className="flex items-center justify-center text-green-600 font-bold text-sm">
                                                        <CheckCircle className="w-4 h-4 mr-1"/> Present
                                                    </div>
                                                ) : (
                                                    // Only show Mark button if Ongoing AND Organizer
                                                    (event.status === 'Ongoing' && isOrganizerView) ? (
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                                                            onClick={() => markAttendance(event.id)}
                                                            disabled={markingAttendance === event.id}
                                                        >
                                                            {markingAttendance === event.id ? '...' : 'Mark Present'}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {event.score !== 'N/A' ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-black text-blue-600">{event.score}</span>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Score</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    </div>
  );
}