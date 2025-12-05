
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import ComingSoon from '@/pages/ComingSoon';
import Registration from '@/pages/Registration';
import Store from '@/pages/Store';
import ProductDetailPage from '@/pages/ProductDetailPage';
import Success from '@/pages/Success';
import ShoppingCart from '@/components/ShoppingCart';
import FloatingCartButton from '@/components/FloatingCartButton';
import { Toaster } from '@/components/ui/toaster';

// SIGARAM Core
import SigaramHome from '@/pages/sigaram/fine_arts/FineArtsHome';
import SigaramGallery from '@/pages/sigaram/fine_arts/ArtworkGallery';
import SigaramArtworkDetail from '@/pages/sigaram/fine_arts/ArtworkDetail';
import SigaramResults from '@/pages/sigaram/fine_arts/FineArtsResults';
import LeaderboardPublic from '@/pages/sigaram/LeaderboardPublic'; 
import ParticipantDirectory from '@/pages/sigaram/ParticipantDirectory';
import SystemDiagnostics from '@/pages/sigaram/SystemDiagnostics';
import EventPublicDetail from '@/pages/sigaram/EventPublicDetail';

// SIGARAM Auth & Portal
import ProtectedRoute from '@/components/ProtectedRoute';
import SigaramAdminLogin from '@/pages/sigaram/SigaramAdminLogin';
import SigaramAdminDashboard from '@/pages/sigaram/SigaramAdminDashboard';
import OrganizerLogin from '@/pages/sigaram/OrganizerLogin';
import OrganizerDashboard from '@/pages/sigaram/OrganizerDashboard';
import OrganizerPasswordReset from '@/pages/sigaram/OrganizerPasswordReset';

import CoordinatorLogin from '@/pages/sigaram/CoordinatorLogin';
import VolunteerLogin from '@/pages/sigaram/VolunteerLogin';
import CoordinatorDashboard from '@/pages/sigaram/CoordinatorDashboard';
import VolunteerDashboard from '@/pages/sigaram/VolunteerDashboard';
import JudgeLogin from '@/pages/sigaram/JudgeLogin'; 

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Router>
      <Helmet>
        <title>Indian Medical Association Hosur - Sigaram 2025</title>
        <meta name="description" content="Official portal for Sigaram 2025 events." />
      </Helmet>
      
      <div className="min-h-screen bg-white relative">
        <Routes>
           <Route path="/leaderboard-public" element={<LeaderboardPublic />} />
           <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>

        <RenderLayout isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
        <Toaster />
      </div>
    </Router>
  );
}

const RenderLayout = ({ isCartOpen, setIsCartOpen }) => {
  const location = useLocation();

  // Layout logic: Hide standard layout for standalone pages
  if (location.pathname === '/coming-soon' || location.pathname.includes('/leaderboard-public')) {
    return null;
  }

  // Check if current page is a dashboard to toggle Navbar/Footer visibility
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <>
      {!isDashboard && <Navbar />}
      
      <Routes>
        {/* Main Landing Page restored to Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        <Route path="/register" element={<Registration />} />
        <Route path="/store" element={<Store />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/success" element={<Success />} />

        {/* Sigaram Routes */}
        <Route path="/sigaram" element={<SigaramHome />} />
        <Route path="/sigaram/gallery" element={<SigaramGallery />} />
        <Route path="/sigaram/artwork/:id" element={<SigaramArtworkDetail />} />
        <Route path="/sigaram/event-details/:id" element={<EventPublicDetail />} />
        <Route path="/sigaram/results" element={<SigaramResults />} />
        <Route path="/sigaram/participant-directory" element={<ParticipantDirectory />} />
        
        {/* ADMIN */}
        <Route path="/sigaram/admin-login" element={<SigaramAdminLogin />} />
        <Route path="/admin/login" element={<Navigate to="/sigaram/admin-login" replace />} />
        <Route path="/sigaram/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']} require2FA={true}>
            <SigaramAdminDashboard />
          </ProtectedRoute>
        } />

        {/* ORGANIZER */}
        <Route path="/sigaram/organizer-login" element={<OrganizerLogin />} />
        <Route path="/sigaram/organizer-password-reset" element={<OrganizerPasswordReset />} />
        <Route path="/sigaram/organizer-dashboard" element={
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        } />
        
        {/* Other Roles */}
        <Route path="/coordinator/login" element={<CoordinatorLogin />} />
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/coordinator/dashboard" element={
          <ProtectedRoute allowedRoles={['organizer', 'coordinator', 'admin']}>
            <CoordinatorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/volunteer/dashboard" element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin', 'organizer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/sigaram/test-suite" element={<SystemDiagnostics />} />
        <Route path="/sigaram/judge-login" element={<JudgeLogin />} />

      </Routes>
      
      {!isDashboard && <Footer />}
      
      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />
    </>
  );
};

export default App;
