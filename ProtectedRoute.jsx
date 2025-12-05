import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [], require2FA = false }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Determine redirect based on expected role if possible, or default
        if (allowedRoles.includes('admin')) setRedirectPath('/sigaram/admin-login');
        else if (allowedRoles.includes('organizer')) setRedirectPath('/coordinator/login');
        else setRedirectPath('/sigaram/admin-login');
        
        setLoading(false);
        return;
      }

      const userRole = session.user.user_metadata?.role || 'participant';

      // Role Check
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        setRedirectPath('/'); // Unauthorized
        setLoading(false);
        return;
      }

      // 2FA Check for Admin
      if (require2FA && userRole === 'admin') {
        const is2FAVerified = localStorage.getItem('admin_2fa_verified') === 'true';
        const expiry = localStorage.getItem('admin_2fa_expiry');
        const now = new Date().getTime();

        if (!is2FAVerified || !expiry || now > parseInt(expiry)) {
             // 2FA missing or expired
             setRedirectPath('/sigaram/admin-login');
             setLoading(false);
             return;
        }
      }

      setHasAccess(true);
      setLoading(false);
    };

    checkAuth();
  }, [allowedRoles, require2FA]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return hasAccess ? children : null;
};

export default ProtectedRoute;