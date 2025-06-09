"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

function HomeHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e : MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Dynamic grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          style={{
            left: `${20 + mousePosition.x * 0.1}%`,
            top: `${10 + mousePosition.y * 0.1}%`,
          }}
        />
        <div
          className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
          style={{
            right: `${20 + mousePosition.x * 0.05}%`,
            bottom: `${10 + mousePosition.y * 0.05}%`,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + Math.sin(i) * 30}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`relative w-full px-4 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

        {/* Header section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-full mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300 text-xs font-mono tracking-wider">KNOWLEDGE MANAGEMENT SYSTEM</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight font-mono tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              NOTES_BREW
            </span>
            {/* <span className="text-white font-light"> v2.0</span> */}
          </h1>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
            <span className="text-2xl">📋</span>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-lg md:text-xl mb-12 leading-relaxed max-w-4xl mx-auto font-light tracking-wide">
          Advanced documentation platform designed for{' '}
          <span className="text-emerald-400 font-medium">notes collaboration</span>{' '}
          and knowledge sharing. Optimize your organization's intellectual assets with{' '}
          <span className="text-blue-400 font-medium">structured data management</span>{' '}
          and real-time synchronization protocols.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link href="/login">
            <button className="group relative px-10 py-4 bg-white text-black rounded-lg font-mono font-semibold text-base tracking-wide overflow-hidden transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-2xl hover:shadow-white/10 border border-gray-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                AUTHENTICATE
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 0V8a2 2 0 00-2-2H6" />
                </svg>
              </span>
            </button>
          </Link>

          <Link href="/signup">
            <button className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-mono font-semibold text-base tracking-wide overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 border border-blue-500/50">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                INITIALIZE ACCOUNT
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </span>
            </button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {[
            {
              icon: "📝",
              title: "Share Notes",
              desc: "Seamless note sharing with organization and real-time collaboration tools",
              gradient: "from-yellow-400/20 to-orange-400/20"
            },
            {
              icon: "💬",
              title: "Instant Messaging",
              desc: "Real-time messaging with one on one chats and group chats",
              gradient: "from-blue-400/20 to-purple-400/20"
            },
            {
              icon: "👥",
              title: "Team Collaboration Hub",
              desc: "Multi-user workspaces with shared documents, group discussions, and project coordination",
              gradient: "from-emerald-400/20 to-green-400/20"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`group p-6 bg-gray-900/40 border border-gray-700/60 rounded-lg backdrop-blur-sm transition-all duration-500 hover:bg-gray-800/50 hover:border-gray-600 hover:scale-105 hover:shadow-2xl`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-base mb-3 group-hover:text-blue-400 transition-colors font-mono tracking-wide">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors font-light">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </>
  );
}

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      <HomeHero />
    </main>
  );
}