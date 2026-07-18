import React, { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Storefront } from "./components/Storefront";
import { Product, AppConfig } from "./types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { Database, AlertTriangle, Key } from "lucide-react";

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [viewingAdmin, setViewingAdmin] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [config, setConfig] = useState<AppConfig>({
    isSupabaseConfigured: isSupabaseConfigured,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || null,
    adminEmail: "example@gmail.com"
  });

  // Fetch products for storefront catalog directly from Supabase
  const fetchProducts = async () => {
    if (!isSupabaseConfigured) return;
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products from Supabase:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Check for persistent session on load and listen to changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthToken(session.access_token);
        setUserEmail(session.user?.email || "");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthToken(session.access_token);
        setUserEmail(session.user?.email || "");
      } else {
        setAuthToken(null);
        setUserEmail("");
      }
    });

    fetchProducts();

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (token: string, email: string) => {
    setAuthToken(token);
    setUserEmail(email);
    setViewingAdmin(true);
    fetchProducts(); // Refresh products on login
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthToken(null);
    setUserEmail("");
    setViewingAdmin(false);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-neutral-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
          
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-50">
                Supabase Connection Required
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                The application is configured to strictly require a live Supabase database.
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-neutral-950/70 border border-neutral-800 rounded-xl p-5 mb-6 text-xs text-neutral-300 leading-relaxed font-mono">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-850 pb-2 mb-2 font-sans font-semibold">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Missing Environment Variables:</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-red-400 font-bold">VITE_SUPABASE_URL</span>
              <span className="text-neutral-500 select-all font-sans italic">Not Set</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-red-400 font-bold">VITE_SUPABASE_ANON_KEY</span>
              <span className="text-neutral-500 select-all font-sans italic">Not Set</span>
            </div>
          </div>

          <div className="space-y-3.5 mb-6 text-sm text-neutral-300 leading-relaxed">
            <h3 className="font-semibold text-neutral-100 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              How to configure:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-400 pl-1 text-xs">
              <li>Open the <span className="text-neutral-200 font-semibold">Settings</span> menu in your AI Studio builder.</li>
              <li>Go to <span className="text-neutral-200 font-semibold">Environment Variables</span>.</li>
              <li>Add <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_URL</code> and paste your Supabase Project URL.</li>
              <li>Add <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_ANON_KEY</code> and paste your Supabase Anon Key.</li>
              <li>Save changes and restart the server/app.</li>
            </ol>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-neutral-500">
              The mock local database has been disabled per configuration instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {viewingAdmin ? (
        authToken ? (
          <div className="relative">
            <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-2.5 flex justify-between items-center text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">Logged in as staff: {userEmail}</span>
              <button 
                onClick={() => {
                  fetchProducts();
                  setViewingAdmin(false);
                }}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer text-[11px]"
              >
                View Customer Storefront
              </button>
            </div>
            <Dashboard 
              userEmail={userEmail} 
              onLogout={handleLogout} 
            />
          </div>
        ) : (
          <div className="relative">
            <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-3 flex justify-between items-center text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">ChickenFeast.ng Staff Portal</span>
              <button 
                onClick={() => setViewingAdmin(false)}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer text-[11px]"
              >
                Back to Storefront
              </button>
            </div>
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              adminEmailDefault={config.adminEmail} 
            />
          </div>
        )
      ) : (
        <Storefront 
          onGoToAdmin={() => setViewingAdmin(true)} 
          products={products}
          loadingProducts={loadingProducts}
        />
      )}
    </div>
  );
}
