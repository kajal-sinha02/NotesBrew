"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default to student
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setError(data.error || "Login failed");
      return;
    }

    // Save token and user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-black/40 border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-mono">
              SYSTEM ACCESS
            </h2>
            <p className="text-gray-400 mt-2 font-mono text-sm tracking-wider">
              AUTHENTICATE TO CONTINUE
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-400 block font-mono tracking-wide">
                ACCESS LEVEL
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer font-mono"
                >
                  <option value="student" className="bg-black text-white">STUDENT</option>
                  <option value="admin" className="bg-black text-white">ADMIN</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-400 block font-mono tracking-wide">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="user@domain.com"
                  className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 font-mono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-400 block font-mono tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                type="submit" 
                className="w-full p-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 active:scale-[0.98] font-mono tracking-wide"
              >
                <span className="flex items-center justify-center gap-2">
                  LOGIN AS {role.toUpperCase()}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button 
                type="button" 
                className="w-full p-4 bg-transparent border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-400/50 active:scale-[0.98] font-mono tracking-wide"
                onClick={() => router.push('/signup')}
              >
                <span className="flex items-center justify-center gap-2">
                  CREATE ACCOUNT
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl">
                <p className="text-red-400 text-center text-sm font-mono tracking-wide">{error}</p>
              </div>
            )}
          </form>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-mono">
              SECURE AUTHENTICATION PORTAL
            </p>
            <div className="flex items-center justify-center mt-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs font-mono tracking-wider">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-green-400/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}