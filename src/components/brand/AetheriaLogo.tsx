import React from "react";

interface AetheriaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
}

export default function AetheriaLogo({
  className = "",
  size = "md",
  showText = true,
  subtitle,
}: AetheriaLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Clean Minimal Icon */}
      <div
        className={`${iconSizes[size]} relative rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shrink-0`}
      >
        <svg
          className="w-1/2 h-1/2 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`${textSizes[size]} font-heading font-normal tracking-wide text-white`}
            >
              Aetheria
            </span>
            <span className="text-[10px] font-medium tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              MEET
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-400 font-normal">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
