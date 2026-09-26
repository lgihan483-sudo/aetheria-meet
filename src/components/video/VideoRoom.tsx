"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, VideoConference, setLogLevel } from "@livekit/components-react";
import AetheriaLogo from "@/components/brand/AetheriaLogo";

interface VideoRoomProps {
  roomName: string;
}

interface TokenData {
  token: string;
  serverUrl: string;
  room: string;
  identity: string;
  expiresIn: string;
}

export default function VideoRoom({ roomName }: VideoRoomProps) {
  const router = useRouter();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active meeting timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch token dynamically from /api/livekit/token
  const fetchToken = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/livekit/token?room=${encodeURIComponent(roomName)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?callbackUrl=/room/${encodeURIComponent(roomName)}`);
          return;
        }
        throw new Error(data.error || `HTTP ${response.status}: Failed to get room access token`);
      }

      setTokenData(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while requesting room access.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [roomName, router]);

  useEffect(() => {
    try {
      setLogLevel("warn");
    } catch {
      // ignore
    }
    fetchToken();
  }, [fetchToken]);

  // Start meeting timer when connected
  useEffect(() => {
    if (tokenData) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tokenData]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDisconnect = () => {
    router.push("/dashboard");
  };

  // State 1: Enterprise Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#070b14] text-slate-100 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e510_0%,transparent_65%)] pointer-events-none" />

        <div className="flex flex-col items-center max-w-sm text-center z-10">
          <div className="mb-6 animate-pulse">
            <AetheriaLogo size="lg" showText={false} />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
            Connecting to Aetheria Mesh
          </h2>
          <p className="text-xs text-slate-400 font-mono mb-6">
            Negotiating SFU session for room: <span className="text-indigo-400 font-bold">{roomName}</span>
          </p>

          <div className="w-56 h-1 bg-slate-800 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full" />
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-500 text-left w-full pl-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span> Authenticated Corporate Identity
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <span>✓</span> Generated 10-Minute Ephemeral Token
            </div>
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="animate-spin">⟳</span> Connecting WebRTC Signaling Gateway...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Error Screen
  if (errorMessage || !tokenData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#070b14] text-slate-100 relative">
        <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900/85 border border-red-500/30 backdrop-blur-2xl shadow-2xl z-10">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">
            Unable to Connect to Conference Room
          </h2>
          <p className="text-xs text-red-300 mb-6 bg-red-950/40 p-3 rounded-xl border border-red-900/50 leading-relaxed font-mono">
            {errorMessage || "Unable to acquire LiveKit room access token."}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors text-center"
            >
              Return to Dashboard
            </button>
            <button
              onClick={fetchToken}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors text-center"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Production Live Video Conference Room
  return (
    <div className="flex flex-col h-screen w-full bg-[#070b14] overflow-hidden">
      {/* Executive Room Top Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        {/* Left: Brand + Meeting Name */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleDisconnect}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Leave Meeting & Return to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <AetheriaLogo size="sm" showText={false} />

          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold text-white tracking-wide font-mono truncate max-w-[180px] sm:max-w-none">
              {roomName}
            </h1>
          </div>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Live SFU
          </span>

          <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/25">
            {formatTimer(elapsedSeconds)}
          </span>
        </div>

        {/* Right: Actions & Identity */}
        <div className="flex items-center gap-3">
          {/* Share Link Button */}
          <button
            onClick={handleCopyLink}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 font-medium ${
              copied
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Invite Participants</span>
              </>
            )}
          </button>

          {/* User Tag */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-200 capitalize font-medium">{tokenData.identity}</span>
          </div>
        </div>
      </header>

      {/* LiveKit Video Conference Container */}
      <div className="flex-1 w-full h-[calc(100vh-4rem)] relative overflow-hidden bg-[#070b14]">
        <LiveKitRoom
          video={true}
          audio={true}
          token={tokenData.token}
          serverUrl={tokenData.serverUrl}
          data-lk-theme="default"
          onDisconnected={handleDisconnect}
          onError={(error) => {
            console.error("[Aetheria LiveKit Error]", error);
            setErrorMessage(error.message);
          }}
          className="h-full w-full"
        >
          {/* Full LiveKit Conference component (Grid, audio, screen share, and control bar) */}
          <VideoConference />
        </LiveKitRoom>
      </div>
    </div>
  );
}
