import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles, LogIn } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (token: string, email: string) => void;
  adminEmailDefault: string;
}

export function Login({ onLoginSuccess, adminEmailDefault }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please check credentials.");
      }

      // Success
      onLoginSuccess(data.token, data.user?.email || email);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(adminEmailDefault || "admin@example.com");
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] font-sans px-4 py-12">
      {/* Decorative subtle ambient circle elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-200/40 rounded-full filter blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-300/30 rounded-full filter blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow duration-300 relative overflow-hidden"
      >
        {/* Subtle accent bar at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neutral-800 to-neutral-500" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-900 text-white rounded-xl mb-4 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
            Admin Console
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            E-commerce Product Management
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 tracking-wider uppercase mb-2 font-sans">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-sm text-neutral-800 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-neutral-600 tracking-wider uppercase font-sans">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-sm text-neutral-800 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-850 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying Credentials...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-150 flex flex-col items-center">
          <p className="text-xs text-neutral-400 mb-3 text-center">
            Trying it out? Fill standard demo credentials in one click:
          </p>
          <button
            onClick={handleFillDemo}
            type="button"
            className="flex items-center gap-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 transition font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Autofill Demo Credentials
          </button>
        </div>
      </motion.div>
    </div>
  );
}
