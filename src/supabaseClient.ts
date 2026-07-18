import { createClient } from "@supabase/supabase-js";

// Safe fallback URL and Key to prevent the app from crashing on startup if not configured yet.
// If not configured, Supabase requests will fail gracefully and the app will operate in local fallback/offline mode.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-please-configure-supabase-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE1OTg4MTI4MDAsImV4cCI6MTkwOTM4ODgwMH0.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

