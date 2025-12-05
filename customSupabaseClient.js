import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvqxnlognynwmmonopns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cXhubG9nbnlud21tb25vcG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTQ4MzUsImV4cCI6MjA3OTI3MDgzNX0.ISMxDQ7ZYYf4TsUEJ760OEO4OE0WmULfr5M66vtz4Hg';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
