import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, ClipboardList, Calendar } from 'lucide-react';
import AttendanceMarking from './components/AttendanceMarking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VolunteerDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/sigaram/volunteer-login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Volunteer Dashboard</h1>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="text-red-600 border-red-100 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="attendance" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white p-1 border rounded-xl">
            <TabsTrigger value="attendance" className="py-3"><ClipboardList className="w-4 h-4 mr-2"/> Mark Attendance</TabsTrigger>
            <TabsTrigger value="schedule" className="py-3"><Calendar className="w-4 h-4 mr-2"/> My Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="bg-white p-6 rounded-xl shadow-sm border min-h-[500px]">
             <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">Attendance Counter</h2>
                <p className="text-sm text-gray-500">Select an event to start marking participants present/absent.</p>
             </div>
             <AttendanceMarking />
          </TabsContent>

          <TabsContent value="schedule" className="bg-white p-6 rounded-xl shadow-sm border">
             <div className="text-center py-12 text-gray-400">
                 <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-200"/>
                 <p>No specific schedule assigned. Please check with the Admin.</p>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}