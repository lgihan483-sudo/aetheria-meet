import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AccessToken } from "livekit-server-sdk";
import { authOptions } from "@/lib/auth";

// Force dynamic execution to prevent route caching and ensure latest environment variables
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Validation regex: Alphanumeric, underscores, and hyphens only, 1-64 characters
const ROOM_NAME_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

interface TokenResponse {
  token?: string;
  serverUrl?: string;
  room?: string;
  identity?: string;
  expiresIn?: string;
  error?: string;
}

async function handleTokenGeneration(roomName: string | null): Promise<NextResponse<TokenResponse>> {
  // 1. Authenticate user session via NextAuth
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized: You must be logged in to request a room token." },
      { status: 401 }
    );
  }

  // 2. Validate Room Name parameter
  if (!roomName || typeof roomName !== "string") {
    return NextResponse.json(
      { error: "Bad Request: 'room' query parameter or payload is required." },
      { status: 400 }
    );
  }

  const trimmedRoom = roomName.trim();
  if (!ROOM_NAME_REGEX.test(trimmedRoom)) {
    return NextResponse.json(
      {
        error:
          "Invalid room name. Room names must be 1 to 64 characters and contain only letters, numbers, hyphens, and underscores.",
      },
      { status: 400 }
    );
  }

  // 3. Verify LiveKit server credentials
  const apiKey = process.env.LIVEKIT_API_KEY ? process.env.LIVEKIT_API_KEY.trim() : undefined;
  const apiSecret = process.env.LIVEKIT_API_SECRET ? process.env.LIVEKIT_API_SECRET.trim() : undefined;
  const serverUrl =
    (process.env.LIVEKIT_URL && process.env.LIVEKIT_URL.trim()) ||
    (process.env.NEXT_PUBLIC_LIVEKIT_URL && process.env.NEXT_PUBLIC_LIVEKIT_URL.trim()) ||
    "wss://test2-oibbhwn1.livekit.cloud";

  // Debug logging to verify key configuration without leaking secrets
  console.log("Using API Key:", apiKey);
  console.log("API Secret is configured:", Boolean(apiSecret));

  if (!apiKey || !apiSecret) {
    console.error(
      "[LiveKit Token Error] Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in environment variables."
    );
    return NextResponse.json(
      {
        error:
          "LiveKit server credentials are not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env.local.",
      },
      { status: 500 }
    );
  }

  // 4. Construct Identity & User metadata
  const user = session.user as { id?: string; name?: string; email?: string };
  const identity = String(user.id || user.name || "anonymous-participant");
  const participantName = String(user.name || "Participant");

  console.log("Generating LiveKit token for Room:", trimmedRoom, "| Identity:", identity);

  try {
    // 5. Generate LiveKit Access Token with strict constraints
    // Requirement: short expiration time (10 minutes) & room-specific grants
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: participantName,
      ttl: "10m", // Exact 10-minute short TTL
    });

    // Grant exact room permissions only
    token.addGrant({
      roomJoin: true,
      room: trimmedRoom,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      serverUrl,
      room: trimmedRoom,
      identity,
      expiresIn: "10m",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate access token";
    console.error("[LiveKit Token Generation Error]", message);
    return NextResponse.json(
      { error: "Internal Server Error: Unable to generate room access token." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const roomName = request.nextUrl.searchParams.get("room");
  return handleTokenGeneration(roomName);
}

export async function POST(request: NextRequest) {
  let roomName: string | null = null;
  try {
    const body = await request.json();
    roomName = body?.room || null;
  } catch {
    // If request body is not JSON or empty, fall back to query params
    roomName = request.nextUrl.searchParams.get("room");
  }

  return handleTokenGeneration(roomName);
}
