import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, Calendar, Users, ClipboardList, Award, LogOut 
} from 'lucide-react';

// Sub-components (Assumed to exist from previous Organizer Dashboard)
import ManageEvents from './components/ManageEvents';
import ParticipantDashboard from './ParticipantDashboard';
import ScoreEntry from './components/ScoreEntry'; 
import AttendanceMarking from './components/AttendanceMarking';
import TeamManagementDashboard from './components/TeamManagementDashboard';

export default function CoordinatorDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('user_role'); // Clear manual role
    navigate('/', { replace: true });
  };

  const menuItems = [
    { id: 'events', label: 'My Events', icon: Calendar, component: <ManageEvents /> },
    { id: 'participants', label: 'Participants', icon: Users, component: <ParticipantDashboard isOrganizerView={true} /> },
    { id: 'teams', label: 'Teams', icon: Users, component: <TeamManagementDashboard /> },
    { id: 'attendance', label: 'Attendance', icon: ClipboardList, component: <AttendanceMarking /> },
    { id: 'scoring', label: 'Score Entry', icon: Award, component: <ScoreEntry /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Coordinator Dashboard</h1>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="gap-2 text-red-600 border-red-100 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex-shrink-0 hidden md:flex flex-col">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border p-6 min-h-[600px]">
            {menuItems.find(m => m.id === activeTab)?.component}
          </div>
        </main>
      </div>
    </div>
  );
}