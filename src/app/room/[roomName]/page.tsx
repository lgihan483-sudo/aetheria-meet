import React from "react";
import { notFound } from "next/navigation";
import VideoRoom from "@/components/video/VideoRoom";

interface RoomPageProps {
  params: {
    roomName: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const roomName = decodeURIComponent(params.roomName || "").trim();

  // Validate room name format
  if (!roomName || !/^[a-zA-Z0-9_-]{1,64}$/.test(roomName)) {
    notFound();
  }

  return (
    <main className="w-full h-screen bg-[#080c14] overflow-hidden">
      <VideoRoom roomName={roomName} />
    </main>
  );
}
