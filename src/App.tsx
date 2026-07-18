import React, { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Storefront } from "./components/Storefront";
import { Product, AppConfig } from "./types";
import { supabase } from "./supabaseClient";

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [viewingAdmin, setViewingAdmin] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [config, setConfig] = useState<AppConfig>({
    isSupabaseConfigured: !!import.meta.env.VITE_SUPABASE_URL,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || null,
    adminEmail: "example@gmail.com"
  });

  // Fetch products for storefront catalog directly from Supabase
  const fetchProducts = async () => {
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
      console.warn("Error fetching products from Supabase, loading from localStorage fallback:", err);
      const localProductsStr = localStorage.getItem("local_products");
      if (localProductsStr) {
        try {
          setProducts(JSON.parse(localProductsStr));
        } catch (e) {
          console.error("Failed to parse local products from localStorage:", e);
        }
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  // Check for persistent session on load and listen to changes
  useEffect(() => {
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
