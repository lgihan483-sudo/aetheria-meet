# SecureLive - Web-Based SFU Video Conferencing Prototype

A prototype for a secure, web-based video conferencing application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **NextAuth.js**, and **LiveKit SFU**.

---

## Architecture Overview

```
               ┌────────────────────────────────────────────────────────┐
               │                  User Browser Client                   │
               └──────────┬───────────────────────────────▲─────────────┘
                          │                               │
       1. Login with      │                               │ 6. WebRTC Media Stream
       Dummy Credentials  │                               │    (Audio / Video /
                          ▼                               │     Screen Share)
               ┌──────────────────────┐                   │
               │ Next.js App (NextAuth)│                   │
               │ - Session Cookie     │                   │
               └──────────┬───────────┘                   │
                          │                               │
       2. Request Token   │                               │
       with Session Cookie│                               │
                          ▼                               │
               ┌──────────────────────┐                   │
               │ /api/livekit/token   │                   │
               │ - Auth verification  │                   │
               │ - 10-minute TTL      │                   │
               │ - Scoped Room Grant  │                   │
               └──────────┬───────────┘                   │
                          │                               │
       3. Issue Signed    │                               │
       Access Token (JWT) │                               │
                          ▼                               │
               ┌──────────────────────┐                   │
               │ LiveKitRoom Component│                   │
               │ - Connects with JWT  │                   │
               └──────────┬───────────┘                   │
                          │                               │
                          │ 4. Connect with Bearer JWT     │
                          ▼                               │
               ┌──────────────────────────────────────────┴─────┐
               │              LiveKit SFU Server                │
               │ (Selective Forwarding Unit / Cloud or Local)   │
               └────────────────────────────────────────────────┘
```

---

## Key Features & Security Controls

1. **NextAuth Dummy Authentication**:
   - Protected routes (`/dashboard` and `/room/:path*`) are guarded by Next.js middleware.
   - Unauthenticated requests automatically redirect to `/login` with callback URLs preserved.
   - Demo preset users (`alex`, `sarah`, `david`) can be selected with 1-click in the UI.

2. **Secure Token Generation (`/api/livekit/token`)**:
   - Authenticates the caller using `getServerSession(authOptions)` server-side.
   - Returns `401 Unauthorized` for unauthenticated requests.
   - Validates room name against regex `^[a-zA-Z0-9_-]{1,64}$` to prevent injection or malicious inputs.

3. **Strict Token Constraints**:
   - Short expiration time: exactly **10 minutes** (`ttl: '10m'`).
   - Granular permissions: Scoped strictly to the requested room (`roomJoin: true`, `room: roomName`, `canPublish: true`, `canSubscribe: true`). Access to any other room is denied.

4. **LiveKit Video Room Client Component**:
   - Built with `@livekit/components-react` (`<LiveKitRoom />` and `<VideoConference />`).
   - Supports HD Video, Audio, Screen Sharing, and Disconnect handling.
   - Includes custom room header with live status, room link sharing, and clean disconnect routing back to the dashboard.

---

## Quick Start & Testing

### 1. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Sign In to the Prototype
1. Navigate to `/login` (or click "Launch Video Portal" from the home page).
2. Click any of the quick-fill demo users (e.g., **alex**, **sarah**, or **david**) or enter any custom username.
3. Click **"Sign In to Dashboard"**.

### 3. Join a Meeting Room
1. On the protected `/dashboard`, enter a room name (e.g. `team-sync`) or click **"Generate Random"**.
2. Alternatively, click any of the preset test rooms (**General Sync**, **Daily Standup**, or **Security Review**).
3. Click **"Join Meeting"**.
4. The client dynamically queries `/api/livekit/token?room=<roomName>` and verifies your NextAuth session before launching the conference room.

---

## Connecting to a LiveKit Server

The application connects to a LiveKit SFU server configured in `.env.local`:

### Option A: Using LiveKit Cloud (Recommended for Zero-Setup Testing)
1. Sign up for a free account at [livekit.io](https://livekit.io).
2. Create a new project.
3. Copy your project's **WebSocket URL** (`wss://<project>.livekit.cloud`), **API Key**, and **API Secret**.
4. Update `.env.local`:
   ```env
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret
   NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
   ```
5. Restart `npm run dev`.

### Option B: Running a Local LiveKit Server
If you have Docker installed, you can launch a local LiveKit instance with default keys matching the `.env.local` file:
```bash
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
  livekit/livekit-server \
  --dev \
  --bind 0.0.0.0 \
  --keys "devkey: secret"
```
The application's default `.env.local` is already configured for this:
```env
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
NEXT_PUBLIC_LIVEKIT_URL=ws://127.0.0.1:7880
```

---

## Multi-User Video Call Testing

To test real-time video/audio between multiple participants:
1. Open [http://localhost:3000](http://localhost:3000) in your primary browser window. Log in as **alex**.
2. Open [http://localhost:3000](http://localhost:3000) in an **Incognito / Private Window** (or a second browser). Log in as **sarah**.
3. Both users navigate to the same room name (e.g., `standup-room`).
4. Grant browser camera and microphone permissions when prompted.
5. Both users will see each other's live video stream, hear audio, and can test screen sharing and muting controls!

---

## Environment Variables Reference

| Variable | Description | Example |
| :--- | :--- | :--- |
| `LIVEKIT_API_KEY` | LiveKit Server API Key | `devkey` or `APIxxxxxxxx` |
| `LIVEKIT_API_SECRET` | LiveKit Server API Secret | `secret` or `sec_xxxxxxx` |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit WebSocket Endpoint | `ws://127.0.0.1:7880` or `wss://<app>.livekit.cloud` |
| `NEXTAUTH_SECRET` | JWT session encryption secret | Random 32+ character hex string |
| `NEXTAUTH_URL` | Canonical root URL of the app | `http://localhost:3000` |
