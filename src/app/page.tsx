import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AetheriaLogo from "@/components/brand/AetheriaLogo";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-[#080c15]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <AetheriaLogo size="md" />

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-heading font-medium px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 text-center max-w-3xl mx-auto">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>LiveKit SFU Infrastructure Active</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-heading text-white leading-tight">
          Secure, Minimal Video Collaboration for Teams
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
          Ultra-low latency audio, video, and screen sharing powered by LiveKit SFU with token-based access control.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
          <Link
            href="/login"
            className="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-sm transition-colors text-center"
          >
            Launch Meeting Hub
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-heading text-sm transition-colors text-center"
          >
            Dashboard
          </Link>
        </div>

        {/* Minimal Specs */}
        <div className="mt-14 grid grid-cols-3 gap-3 w-full max-w-md">
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 text-center">
            <div className="text-lg font-heading text-white">45ms</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Edge Latency</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 text-center">
            <div className="text-lg font-heading text-indigo-400">10m</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Token TTL</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 text-center">
            <div className="text-lg font-heading text-emerald-400">DTLS</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Encrypted</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Aetheria Technologies. Minimal WebRTC Collaboration.
      </footer>
    </main>
  );
}
