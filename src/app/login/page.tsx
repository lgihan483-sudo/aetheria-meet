"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AetheriaLogo from "@/components/brand/AetheriaLogo";

const CORPORATE_PRESET_USERS = [
  {
    key: "alex",
    name: "Alex Rivera",
    role: "VP of Engineering",
  },
  {
    key: "sarah",
    name: "Sarah Chen",
    role: "Product Director",
  },
  {
    key: "david",
    name: "David Vance",
    role: "Director of InfoSec",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Please enter your corporate identity to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("dummy-credentials", {
        username: username.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage(res.error || "Authentication failed.");
        setIsLoading(false);
        return;
      }

      if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("Network error occurred during sign in.");
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (key: string) => {
    setUsername(key);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 shadow-xl shadow-black/40">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AetheriaLogo size="lg" showText={false} />
          </div>
          <h1 className="text-xl font-heading text-white">
            Aetheria Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with your corporate identity
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Directory Fast Select */}
        <div className="mb-5">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Select Employee Profile
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CORPORATE_PRESET_USERS.map((user) => {
              const isSelected = username.toLowerCase() === user.key.toLowerCase();
              return (
                <button
                  key={user.key}
                  type="button"
                  onClick={() => handleSelectPreset(user.key)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500/80 text-indigo-200"
                      : "bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="text-xs font-heading text-white truncate">{user.name.split(" ")[0]}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{user.role}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Corporate Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex.rivera"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 text-sm transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Password <span className="text-slate-500 text-[10px] font-normal">(Optional prototype)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-sm transition-colors disabled:opacity-60 shadow-sm"
          >
            {isLoading ? "Signing in..." : "Continue to Workspace"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <span className="text-[11px] text-slate-500 font-medium">
            Protected by Zero-Trust Token Verification
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#080c15]">
      <Suspense
        fallback={
          <div className="text-center text-slate-400 text-xs py-8">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
