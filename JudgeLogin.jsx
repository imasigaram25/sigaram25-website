import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Placeholder for Judge Login to prevent broken links
export default function JudgeLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    // Redirecting judges to organizer login for now as per cleanup instructions
    // or implement a simple "Under Maintenance" if preferred. 
    // Given the strict "DELETE" instruction, a redirect is safest.
    navigate('/sigaram/organizer-login', { replace: true });
  }, [navigate]);
  return null;
}