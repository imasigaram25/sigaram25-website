
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users, UserCog, Database, LogOut, ShieldCheck, Trophy } from 'lucide-react';
import { clearAllSessions } from '@/lib/authUtils';

// Sub-components
import ManageEvents from './components/ManageEvents';
import ManageParticipants from './components/ManageParticipants';
import ManageOrganisers from './components/ManageOrganisers';
import DataManagement from './components/DataManagement';
import AdminScoringDashboard from './components/AdminScoringDashboard'; // New Import

const SigaramAdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
      await clearAllSessions();
      navigate('/sigaram/admin-login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Header */}
       <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
           <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                   <div className="bg-white/10 p-2 rounded-lg">
                       <ShieldCheck className="w-6 h-6 text-yellow-400" />
                   </div>
                   <div>
                       <h1 className="text-xl font-bold tracking-tight">Sigaram 2025</h1>
                       <p className="text-xs text-blue-200 uppercase tracking-widest">Admin Console</p>
                   </div>
               </div>
               <Button onClick={handleLogout} variant="ghost" className="text-blue-200 hover:text-white hover:bg-white/10">
                   <LogOut className="w-4 h-4 mr-2" /> Logout
               </Button>
           </div>
       </header>

       <main className="max-w-7xl mx-auto px-6 py-8">
           <Tabs defaultValue="scoring" className="space-y-8">
               <div className="bg-white p-2 rounded-xl shadow-sm border inline-flex overflow-x-auto max-w-full">
                   <TabsList className="flex w-auto min-w-max bg-transparent">
                        <TabsTrigger value="scoring" className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 font-bold px-6">
                           <Trophy className="w-4 h-4 mr-2" /> Scoring & Results
                       </TabsTrigger>
                       <TabsTrigger value="events" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-bold px-6">
                           <Calendar className="w-4 h-4 mr-2" /> Events
                       </TabsTrigger>
                       <TabsTrigger value="participants" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-bold px-6">
                           <Users className="w-4 h-4 mr-2" /> Participants
                       </TabsTrigger>
                       <TabsTrigger value="organisers" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-bold px-6">
                           <UserCog className="w-4 h-4 mr-2" /> Organisers
                       </TabsTrigger>
                       <TabsTrigger value="data" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 font-bold px-6">
                           <Database className="w-4 h-4 mr-2" /> Data Tools
                       </TabsTrigger>
                   </TabsList>
               </div>

                <TabsContent value="scoring" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <AdminScoringDashboard />
               </TabsContent>

               <TabsContent value="events" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <ManageEvents />
               </TabsContent>

               <TabsContent value="participants" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <ManageParticipants />
               </TabsContent>

               <TabsContent value="organisers" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <ManageOrganisers />
               </TabsContent>

               <TabsContent value="data" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <DataManagement />
               </TabsContent>
           </Tabs>
       </main>
    </div>
  );
};

export default SigaramAdminDashboard;
