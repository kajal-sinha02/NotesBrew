"use client";
import HomeHero from "./components/HomeHero";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full bg-black">
      <HomeHero />
    </main>
  );
}