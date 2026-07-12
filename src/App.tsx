import React, { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { AppConfig } from "./types";

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [config, setConfig] = useState<AppConfig>({
    isSupabaseConfigured: false,
    supabaseUrl: null,
    adminEmail: "example@gmail.com"
  });

  // Check for persistent session on load
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_auth_token");
    const savedEmail = localStorage.getItem("admin_user_email");

    if (savedToken && savedEmail) {
      setAuthToken(savedToken);
      setUserEmail(savedEmail);
    }

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
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("admin_user_email");
    setAuthToken(null);
    setUserEmail("");
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {authToken ? (
        <Dashboard 
          userEmail={userEmail} 
          onLogout={handleLogout} 
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          adminEmailDefault={config.adminEmail} 
        />
      )}
    </div>
  );
}
