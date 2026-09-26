"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AetheriaLogo from "@/components/brand/AetheriaLogo";

const CORPORATE_ROOMS = [
  {
    name: "executive-town-hall",
    label: "Executive Town Hall",
    dept: "Company-Wide",
    icon: "🏛️",
  },
  {
    name: "eng-sprint-planning",
    label: "Sprint Planning",
    dept: "Engineering",
    icon: "⚡",
  },
  {
    name: "sec-incident-war-room",
    label: "Incident War Room",
    dept: "InfoSec Team",
    icon: "🛡️",
  },
  {
    name: "product-design-review",
    label: "Product & UX Review",
    dept: "Design Team",
    icon: "🎨",
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Hardware Pre-flight status
  const [mediaCheckStatus, setMediaCheckStatus] = useState<"idle" | "testing" | "ready" | "denied">("idle");
  const [deviceSummary, setDeviceSummary] = useState<string | null>(null);

  const testMediaDevices = async () => {
    setMediaCheckStatus("testing");
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        setDeviceSummary(`Camera: ${videoTrack?.label ? "Ready" : "Active"} • Mic: ${audioTrack?.label ? "Ready" : "Active"}`);
        stream.getTracks().forEach((t) => t.stop());
        setMediaCheckStatus("ready");
      } else {
        setMediaCheckStatus("denied");
      }
    } catch {
      setMediaCheckStatus("denied");
      setDeviceSummary("Camera or Microphone permission was not granted.");
    }
  };

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const hasVideo = devices.some((d) => d.kind === "videoinput");
          const hasAudio = devices.some((d) => d.kind === "audioinput");
          if (hasVideo && hasAudio) {
            setMediaCheckStatus("ready");
            setDeviceSummary("Camera & Microphone detected");
          }
        })
        .catch(() => {});
    }
  }, []);

  const generateSecureRoom = () => {
    const prefixes = ["meet", "sync", "lab", "hub", "room"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const code = Math.floor(1000 + Math.random() * 9000);
    setRoomInput(`${prefix}-${code}`);
    setError(null);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanRoom = roomInput.trim().toLowerCase();
    if (!cleanRoom) {
      setError("Please specify a room identifier to enter the session.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(cleanRoom)) {
      setError("Room identifier must be 1-64 characters (letters, numbers, hyphens, and underscores only).");
      return;
    }

    router.push(`/room/${encodeURIComponent(cleanRoom)}`);
  };

  const handleQuickJoin = (roomName: string) => {
    setRoomInput(roomName);
    setError(null);
    router.push(`/room/${encodeURIComponent(roomName)}`);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#080c15] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AetheriaLogo size="md" showText={false} />
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-heading">Verifying session authorization...</p>
        </div>
      </div>
    );
  }

  const user = session?.user as {
    name?: string;
    email?: string;
    id?: string;
    role?: string;
    department?: string;
  };

  const username = user?.name || "Corporate Member";
  const userEmail = user?.email || "employee@aetheria.corp";
  const userRole = user?.role || "Enterprise Member";

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/60 bg-[#080c15]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AetheriaLogo size="md" />
            <div className="hidden sm:flex items-center gap-1.5 pl-4 border-l border-slate-800 text-[11px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SFU Mesh Online</span>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-heading font-medium text-white">{username}</span>
              <span className="text-[10px] text-slate-400">{userRole}</span>
            </div>

            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-heading text-xs text-indigo-300">
              {username.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Top Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading text-white">
              Welcome, {username}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Start an instant WebRTC conference or enter an existing meeting room.
            </p>
          </div>

          {/* Minimal Device Status */}
          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2">
            <span
              className={`w-2 h-2 rounded-full ${
                mediaCheckStatus === "ready"
                  ? "bg-emerald-400"
                  : mediaCheckStatus === "denied"
                  ? "bg-rose-400"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-xs text-slate-300 font-medium truncate max-w-[180px]">
              {deviceSummary || "Hardware check"}
            </span>
            <button
              type="button"
              onClick={testMediaDevices}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors pl-2 border-l border-slate-800"
            >
              Test
            </button>
          </div>
        </div>

        {/* Meeting Join / Launch Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Join Panel (2 cols) */}
          <div className="md:col-span-2 rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-heading text-white">Join Meeting</h2>
              <button
                type="button"
                onClick={generateSecureRoom}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Generate Random Room
              </button>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <input
                  id="room-name"
                  type="text"
                  value={roomInput}
                  onChange={(e) => {
                    setRoomInput(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. daily-standup or meet-1249"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 text-sm font-medium transition-colors"
                />
                {error && (
                  <p className="text-xs text-rose-400 mt-1.5">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-sm transition-colors shadow-sm"
              >
                Enter Meeting Room
              </button>
            </form>

            {/* Quick Standing Rooms */}
            <div className="pt-4 border-t border-slate-800/60">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-3">
                Quick Join Channels
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CORPORATE_ROOMS.map((room) => (
                  <button
                    key={room.name}
                    type="button"
                    onClick={() => handleQuickJoin(room.name)}
                    className="p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/70 hover:border-slate-700 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{room.icon}</span>
                      <div>
                        <div className="text-xs font-heading text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {room.label}
                        </div>
                        <div className="text-[10px] text-slate-500">/{room.name}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300">
                      Join →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Rail: Minimal Security Overview */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-4">
            <h3 className="text-xs font-heading text-white uppercase tracking-wider">
              Security Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Identity</span>
                <span className="text-slate-200 font-medium">Session-Bound SSO</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Token Lifetime</span>
                <span className="text-slate-200 font-medium">10 Minutes</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Scope</span>
                <span className="text-slate-200 font-medium">Target Room Only</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Encryption</span>
                <span className="text-emerald-400 font-medium">DTLS-SRTP</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Architecture</span>
                <span className="text-indigo-400 font-medium">LiveKit SFU</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 leading-relaxed">
              Tokens are issued dynamically via server-side session checks and expire automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
