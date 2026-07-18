import { createClient } from "@supabase/supabase-js";

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-please-configure-supabase-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE1OTg4MTI4MDAsImV4cCI6MTkwOTM4ODgwMH0.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



