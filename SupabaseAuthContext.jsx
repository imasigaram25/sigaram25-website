import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to safely clear all auth data from local storage
  const safeSignOut = useCallback(async () => {
    try {
      // Attempt Supabase sign out
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut failed, clearing local storage manually", e);
    } finally {
      // Force clear local storage to remove bad tokens
      localStorage.clear();
      setUser(null);
      setSession(null);
      setRole(null);
    }
  }, []);

  const handleSession = useCallback((currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);
    
    // Extract role from metadata safely
    const extractedRole = 
      currentUser?.app_metadata?.userrole || 
      currentUser?.user_metadata?.role || 
      null;
      
    setRole(extractedRole);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial Session Check
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        handleSession(data.session);
      } catch (error) {
        console.error("Session check failed:", error);
        
        // Check specifically for the refresh token error
        if (error.message && (
            error.message.includes("Refresh Token Not Found") || 
            error.message.includes("Invalid Refresh Token")
        )) {
            console.log("Detected invalid refresh token. Clearing session.");
            await safeSignOut();
        }
        setLoading(false);
      }
    };

    getSession();

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            setRole(null);
            setLoading(false);
        } else if (event === 'TOKEN_REFRESH_REVOKED') {
            console.log("Token refresh revoked");
            await safeSignOut();
        } else {
            handleSession(newSession);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession, safeSignOut]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Authentication error",
      });
      return { error };
    }

    return { data, error: null };
  }, [toast]);

  const signOut = useCallback(async () => {
    await safeSignOut();
    toast({
      title: "Signed Out",
      description: "You have been safely logged out.",
    });
    return { error: null };
  }, [toast, safeSignOut]);

  const value = useMemo(() => ({
    user,
    session,
    role,
    loading,
    signIn,
    signOut,
  }), [user, session, role, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};