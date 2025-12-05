import { supabase } from '@/lib/customSupabaseClient';

/**
 * Clears all local storage, session storage, and attempts to sign out from Supabase.
 * Used to ensure a completely clean state before login or after logout.
 */
export const clearAllSessions = async () => {
  console.log("🧹 Clearing all sessions and local data...");
  
  // 1. Clear Local and Session Storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error("Error clearing storage:", e);
  }

  // 2. Clear Cookies (helper to expire them)
  try {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  } catch (e) {
    console.error("Error clearing cookies:", e);
  }

  // 3. Sign out from Supabase (Server-side session)
  // We wrap this in try/catch to ignore 403s or network errors during cleanup
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("Supabase signOut warning (ignored during cleanup):", error.message);
  } catch (e) {
    console.warn("Supabase signOut exception (ignored during cleanup):", e);
  }
  
  console.log("✨ Session cleanup complete.");
};