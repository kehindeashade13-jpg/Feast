import React, { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Storefront } from "./components/Storefront";
import { Product, AppConfig } from "./types";

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [viewingAdmin, setViewingAdmin] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [config, setConfig] = useState<AppConfig>({
    isSupabaseConfigured: false,
    supabaseUrl: null,
    adminEmail: "example@gmail.com"
  });

  // Fetch products for storefront catalog
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Check for persistent session on load
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_auth_token");
    const savedEmail = localStorage.getItem("admin_user_email");

    if (savedToken && savedEmail) {
      setAuthToken(savedToken);
      setUserEmail(savedEmail);
    }

    fetchProducts();

    // Load server-side configurations
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
      })
      .catch((err) => console.error("Error loading backend config:", err));
  }, []);

  const handleLoginSuccess = (token: string, email: string) => {
    localStorage.setItem("admin_auth_token", token);
    localStorage.setItem("admin_user_email", email);
    setAuthToken(token);
    setUserEmail(email);
    setViewingAdmin(true);
    fetchProducts(); // Refresh products on login
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("admin_user_email");
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
