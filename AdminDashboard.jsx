
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, LayoutDashboard, Users, Calendar, ClipboardList, Award, TrendingUp, Settings } from 'lucide-react';
import ManageEvents from './components/ManageEvents';
import ExportData from './components/ExportData';
import ScoreApproval from './components/ScoreApproval';
import AttendanceReport from './components/AttendanceReport';
import UploadParticipantDirectoryCSV from './components/UploadParticipantDirectoryCSV';
import AdminScoringConfig from './components/AdminScoringConfig';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage events, participants, and system settings.</p>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[900px]">
          <TabsTrigger value="events"><Calendar className="w-4 h-4 mr-2"/> Events</TabsTrigger>
          <TabsTrigger value="attendance"><ClipboardList className="w-4 h-4 mr-2"/> Attendance</TabsTrigger>
          <TabsTrigger value="scores"><Award className="w-4 h-4 mr-2"/> Scores</TabsTrigger>
          <TabsTrigger value="config"><Settings className="w-4 h-4 mr-2"/> Config</TabsTrigger>
          <TabsTrigger value="tools"><FileSpreadsheet className="w-4 h-4 mr-2"/> Data Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <ManageEvents />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceReport />
        </TabsContent>

        <TabsContent value="scores" className="mt-6">
           <ScoreApproval />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
            <AdminScoringConfig />
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
             <UploadParticipantDirectoryCSV />
             <ExportData />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
