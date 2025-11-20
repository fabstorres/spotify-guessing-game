import { serve } from "bun";
import index from "@/index.html";
import { createSession, getSession } from "@/server/db";
import { randomUUID } from "crypto";
import { Spotify, type SpotifyUser } from "@/server/spotify";

const rooms = new Map<string, {
  id: string;
  users: {
    session_id: string;
    user: SpotifyUser
  }[]
}>();

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    // TODO: if session is expired, and refresh token is valid, refresh access token
    "/spotify/login": {
      async GET(req) {
        const state = crypto.randomUUID();
        const session_id = req.headers.get("Cookie")?.split(";").find((cookie) => cookie.startsWith("sid="))?.split("=")[1];
        if (session_id) {
          const session = await getSession(session_id); // We can always gurantee that the session is not expired if not null
          if (session) {
            return Response.redirect("http://127.0.0.1:3000");
          }
        }
        const query = {
          response_type: 'code',
          client_id: Bun.env.SPOTIFY_CLIENT_ID!,
          scope: 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-top-read',
          redirect_uri: 'http://127.0.0.1:3000/spotify/callback',
          state: state
        }

        return Response.redirect(`https://accounts.spotify.com/authorize?${new URLSearchParams(query).toString()}`)
      },
    },
    // TODO: enforce result on fetches return type with zod
    // TODO: handle errors gracefully
    "/spotify/callback": {
      async GET(req) {
        const { searchParams } = new URL(req.url);
        const state = searchParams.get('state');
        const code = searchParams.get('code');
        if (!state || !code) {
          return Response.json({ error: 'No state or code' });
        }

        const results = await fetch(`https://accounts.spotify.com/api/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${Bun.env.SPOTIFY_CLIENT_ID}:${Bun.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://127.0.0.1:3000/spotify/callback',
            state
          })
        })

        if (results.status !== 200) {
          return Response.json({ error: 'Invalid code' });
        }

        const data = await results.json()
        const session_id = crypto.randomUUID()
        createSession(session_id, data.access_token, data.refresh_token, data.expires_in);

        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          [
            `sid=${session_id}`,
            "HttpOnly",
            Bun.env.NODE_ENV === "production" ? "Secure" : "",
            "SameSite=Lax",
            "Path=/",
            `Max-Age=${60 * 60 * 24 * 7}`
          ].join("; ")
        );

        return new Response("ok", { status: 200, headers });
      }
    },
    // Add a cache for lobby data
    "/api/games/create": {
      async POST(req) {
        console.log("[api/games/create] headers: ", req.headers);
        const session_id = req.headers.get("Cookie")?.split(";").find((cookie) => cookie.startsWith("sid="))?.split("=")[1];
        console.log("[api/games/create] session id: ", session_id);
        if (!session_id) {
          console.log("No session id");
          return new Response("No session id", { status: 401 })
        }
        const session = await getSession(session_id);
        if (!session) {
          console.log("No session");
          return new Response("No session", { status: 401 })
        }

        const [userDataResults, topTracksResults] = await Promise.all([
          Spotify.getUserData(session.access_token),
          Spotify.getUserTopTracks(session.access_token)
        ])

        if (!userDataResults.success || !topTracksResults.success) {
          return Response.json({ error: "Failed to get user data" });
        }

        const roomCode = randomUUID().slice(0, 4)
        rooms.set(roomCode, {
          id: roomCode,
          users: [
            {
              session_id,
              user: userDataResults.data
            }
          ]
        })

        return Response.json({
          roomCode
        }, { status: 200 })
      }
    },
    "/api/games/join": {
      async POST(req) {
        const session_id = req.headers.get("Cookie")?.split(";").find((cookie) => cookie.startsWith("sid="))?.split("=")[1];
        if (!session_id) {
          return Response.json({ error: "No session id" });
        }
        const session = await getSession(session_id);
        if (!session) {
          return Response.json({ error: "No session" });
        }

        const { roomCode } = await req.json();

        if (!roomCode) {
          return Response.json({ error: "No room code" });
        }

        // check if room exists and not full

        // const [userDataResults, topTracksResults] = await Promise.all([
        //   Spotify.getUserData(session.access_token),
        //   Spotify.getUserTopTracks(session.access_token)
        // ])

        // if (!userDataResults.success || !topTracksResults.success) {
        //   return Response.json({ error: "Failed to get user data" });
        // }

        // insert data into lobby

        return Response.json({
          roomCode
        })
      }
    },
    "/ws/game": {
      async GET(req) {
        if (server.upgrade(req)) {
          return new Response(null);
        }
        return new Response("Expected WebSocket upgrade", {
          status: 426,
          headers: { Upgrade: "websocket" },
        });
      }
    },

  },
  // TODO: the dummy rooms data is not to be used for later. This is just for testing purposes
  websocket: {
    open: (ws) => { console.log("open",); ws.send(JSON.stringify(rooms.values().next().value)) },
    close: (ws) => { console.log("close"); },
    message: (ws) => { console.log("message"); },
  },
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
