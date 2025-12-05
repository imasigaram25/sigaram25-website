import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import OrganizerDashboard from './OrganizerDashboard';
import VolunteerDashboard from './VolunteerDashboard';

/**
 * Main Routing Portal for Sigaram
 * Handles role-based redirection and component rendering.
 */
export default function SigaramPortal() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Verifying Access Permissions...</p>
      </div>
    );
  }

  if (!user) {
    // Not authenticated, kick to home or specific login if we knew where they came from
    // For safety, we send to Organizer login as default entry point
    return <Navigate to="/sigaram/organizer-login" replace />;
  }

  // Role-based Routing
  switch (role) {
    case 'admin':
      return <AdminDashboard />;
      
    case 'organizer':
      return <OrganizerDashboard />;
    
    case 'volunteer':
      return <VolunteerDashboard />;
      
    // Judges or Participants shouldn't be here in this strict portal
    // But if they are, we redirect them out
    default:
      console.warn(`Unauthorized role access attempt: ${role}`);
      return <Navigate to="/sigaram/organizer-login" replace />;
  }
}