import type { Metadata } from "next";
import "@livekit/components-styles";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Aetheria Meet | Enterprise Video Workspace",
  description:
    "Mission-critical, zero-trust video conferencing powered by LiveKit SFU and next-generation WebRTC media infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen selection:bg-indigo-500/25 selection:text-indigo-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
