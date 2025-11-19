import { serve } from "bun";
import index from "./index.html";
import { createSession, getSession } from "./server/db";

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
          const session = getSession(session_id);
          if (session && session.expires_at > Math.floor(Date.now() / 1000)) {
            return Response.redirect("http://127.0.0.1:3000");
          }
        }
        const query = {
          response_type: 'code',
          client_id: Bun.env.SPOTIFY_CLIENT_ID!,
          scope: 'user-read-private user-read-email playlist-read-private playlist-read-collaborative',
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
            "Secure",
            "SameSite=Lax",
            "Path=/",
            `Max-Age=${60 * 60 * 24 * 7}`
          ].join("; ")
        );

        return new Response("ok", { status: 200, headers });
      }
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
