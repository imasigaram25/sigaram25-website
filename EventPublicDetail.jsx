
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react';

const EventPublicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // Fetch Event Info
      const { data: eventData, error: eventError } = await supabase
        .from('sigaram_events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch Participants for this event
      const { data: pData, error: pError } = await supabase
        .from('sigaram_event_participants')
        .select('*')
        .eq('event_id', id)
        .order('name');
        
      if (pError) throw pError;
      setParticipants(pData || []);

    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;
  }

  if (!event) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Event not found</h2>
          <Button onClick={() => navigate('/sigaram')}>Back to Home</Button>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate('/sigaram')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2"/> Back to Events
        </Button>

        {/* Event Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100">
          <h1 className="text-3xl font-black text-gray-900 mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-6 text-gray-600">
             <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500"/>
                <span className="font-medium">{event.event_time}</span>
             </div>
             <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500"/>
                <span className="font-medium">{event.location || 'Venue TBA'}</span>
             </div>
             <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500"/>
                <span className="font-medium">{participants.length} Participants Registered</span>
             </div>
          </div>
        </div>

        {/* Participants Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600"/> Registered Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
                 No participants registered yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                     <tr>
                       <th className="px-6 py-4">Name</th>
                       <th className="px-6 py-4">Team</th>
                       <th className="px-6 py-4">Branch</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y">
                    {participants.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                        <td className="px-6 py-4 text-gray-600">{p.team_name || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{p.ima_branch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventPublicDetail;
