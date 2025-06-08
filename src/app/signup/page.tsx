"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Organization {
  _id: string;
  name: string;
  description: string;
  location: string;
  contactEmail: string;
}

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    organization: "", // Add organization field
  });
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch organizations when component mounts or when role changes to student
  useEffect(() => {
    if (form.role === "student") {
      fetchOrganizations();
    }
  }, [form.role]);

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrganizations(data.organizations);
        } else {
          console.error("Failed to fetch organizations:", data.error);
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset organization when role changes
    if (name === "role") {
      setForm({ ...form, [name]: value, organization: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate organization selection for students
    if (form.role === "student" && !form.organization) {
      setMessage("Please select an organization");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
     router.push("/login");
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-mono">
              CREATE ACCOUNT
            </h2>
            <p className="text-gray-400 mt-2 font-mono text-sm tracking-wider">
              REGISTER NEW USER
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-400 block font-mono tracking-wide">
                FULL NAME
              </label>
              <div className="relative">
                <input
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 font-mono"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                  name="email"
                  type="email"
                  placeholder="user@domain.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 font-mono"
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
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 font-mono"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-400 block font-mono tracking-wide">
                ACCESS LEVEL
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer font-mono"
                >
                  <option value="student" className="bg-black text-white">STUDENT</option>
                  <option value="admin" className="bg-black text-white">ADMINISTRATOR</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Organization Selection - only for students */}
            {form.role === "student" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-400 block font-mono tracking-wide">
                  ORGANIZATION *
                </label>
                <div className="relative">
                  {loadingOrgs ? (
                    <div className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-gray-400 text-center font-mono">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-green-400 rounded-full animate-spin"></div>
                        LOADING ORGANIZATIONS...
                      </div>
                    </div>
                  ) : organizations.length === 0 ? (
                    <div className="w-full p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-400 text-center font-mono text-sm">
                      NO ORGANIZATIONS AVAILABLE
                      <br />
                      CONTACT ADMINISTRATOR
                    </div>
                  ) : (
                    <>
                      <select
                        name="organization"
                        value={form.organization}
                        onChange={handleChange}
                        required={form.role === "student"}
                        className="w-full p-4 bg-black/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer font-mono"
                      >
                        <option value="" className="bg-black text-white">SELECT ORGANIZATION</option>
                        {organizations.map((org) => (
                          <option key={org._id} value={org._id} className="bg-black text-white">
                            {org.name.toUpperCase()} - {org.location.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Organization Details */}
                {organizations.length > 0 && form.organization && (
                  <div className="mt-3 p-4 bg-cyan-900/20 border border-cyan-700/50 rounded-xl">
                    <div className="text-cyan-400 font-mono text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-bold tracking-wider">SELECTED ORGANIZATION</span>
                      </div>
                      <div className="text-white">
                        <span className="text-green-400">NAME:</span> {organizations.find(org => org._id === form.organization)?.name}
                      </div>
                      <div className="text-white mt-1">
                        <span className="text-green-400">DESC:</span> {organizations.find(org => org._id === form.organization)?.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={form.role === "student" && loadingOrgs}
              className="w-full p-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 active:scale-[0.98] font-mono tracking-wide"
            >
              <span className="flex items-center justify-center gap-2">
                {loadingOrgs && form.role === "student" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    LOADING...
                  </>
                ) : (
                  <>
                    CREATE ACCOUNT
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl border font-mono text-sm ${
                message.includes("error") || message.includes("Error")
                  ? "bg-red-900/20 border-red-700/50 text-red-400"
                  : "bg-green-900/20 border-green-700/50 text-green-400"
              }`}>
                <div className="flex items-center gap-2">
                  {message.includes("error") || message.includes("Error") ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="tracking-wide">{message.toUpperCase()}</span>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-mono">
              USER REGISTRATION PORTAL
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