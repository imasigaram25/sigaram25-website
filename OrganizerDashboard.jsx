
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Calendar, ClipboardList, Award, LogOut, ShieldAlert, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

// Sub-components
import ManageEvents from './components/ManageEvents'; // Used for general event lookup if needed, or restricted
import AttendanceMarking from './components/AttendanceMarking';
import ScoreEntry from './components/ScoreEntry'; 
import EventManagementPortal from './components/EventManagementPortal'; // New Component

export default function OrganizerDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rights, setRights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("default");

  useEffect(() => {
      if (user?.id) fetchRights();
  }, [user]);

  const fetchRights = async () => {
      setLoading(true);
      try {
          const { data, error } = await supabase
            .from('sigaram_profiles')
            .select('rights')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          const userRights = data?.rights || [];
          setRights(userRights);

          // Set initial active tab based on rights priority
          if (userRights.includes('event_management')) setActiveTab('management');
          else if (userRights.includes('scoring')) setActiveTab('scores');
          else if (userRights.includes('attendance')) setActiveTab('attendance');
          else setActiveTab('no_access');

      } catch (err) {
          console.error("Error fetching rights:", err);
          toast({ title: "Error", description: "Could not verify permissions.", variant: "destructive" });
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/sigaram/organizer-login', { replace: true });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading permissions...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <LayoutGrid className="text-indigo-600 w-6 h-6"/>
                <h1 className="font-bold text-gray-900 text-lg">Organizer Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:inline">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50 border-red-100">
                    <LogOut className="w-4 h-4 mr-2"/> Logout
                </Button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'no_access' ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4"/>
                <h2 className="text-xl font-bold text-gray-800">Access Restricted</h2>
                <p className="text-gray-500">You do not have any specific permissions assigned. Please contact the administrator.</p>
            </div>
        ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-lg inline-flex shadow-sm flex-wrap h-auto">
                    {rights.includes('event_management') && (
                        <TabsTrigger value="management" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-6 py-2">
                            <Settings className="w-4 h-4 mr-2"/> Event Management
                        </TabsTrigger>
                    )}
                    {rights.includes('attendance') && (
                        <TabsTrigger value="attendance" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-6 py-2">
                            <ClipboardList className="w-4 h-4 mr-2"/> Mark Attendance
                        </TabsTrigger>
                    )}
                    {rights.includes('scoring') && (
                        <TabsTrigger value="scores" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-6 py-2">
                            <Award className="w-4 h-4 mr-2"/> Enter Marks
                        </TabsTrigger>
                    )}
                </TabsList>

                <div className="bg-white rounded-xl shadow-sm border min-h-[600px] p-6">
                    {rights.includes('event_management') && (
                        <TabsContent value="management" className="mt-0">
                            <EventManagementPortal />
                        </TabsContent>
                    )}
                    {rights.includes('attendance') && (
                        <TabsContent value="attendance" className="mt-0">
                            <AttendanceMarking />
                        </TabsContent>
                    )}
                    {rights.includes('scoring') && (
                        <TabsContent value="scores" className="mt-0">
                            <ScoreEntry />
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        )}
      </main>
    </div>
  );
}
