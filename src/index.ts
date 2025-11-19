import { randomUUIDv5, serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/spotify/login": {
      async GET(req) {
        const state = randomUUIDv5('https://accounts.spotify.com/authorize', 'url');
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
        console.log(data)
        return new Response(data)
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
