# Spotify Guessing Game

A simple game where you try to guess which friend has a song on their playlist.

## Introduction

This project began as a remake (or, more accurately, a reimagining) of a friend’s original idea: a small multiplayer game powered by Spotify data.

My friend’s version got Spotify OAuth2 working inside a Next.js Pages Router, but once the systems for lobbies and multiplayer state came into play, the need for a different architecture became clear. The challenge was trying to fit everything inside Next.js, which ultimately became the bottleneck.

My approach takes the opposite route by using Bun’s ability to build full-stack applications with its React template. The goal is for Bun to serve React to the client while also exposing a route for WebSocket connections. This keeps the original project’s monolithic approach while opening the door to a more maintainable setup.

## Milestones

- [x] Setup Bun and React
- [x] Setup Spotify OAuth2
- [x] Database Integration
- [x] Session Tokens for Clients
- [x] Setup WebSockets
- [x] Generate Room Code for Creation and Joining
- [x] Fetch Spotify Data
- [x] Implement Refresh Tokens
- [ ] Setup Lobbies
- [ ] Create Game Logic

## Tech Stack

- [Bun](https://bun.sh)
- [React](https://reactjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Spotify Web API](https://developer.spotify.com/web-api)

## License

[MIT](https://github.com/fabstorres/spotify-guessing-game/blob/main/LICENSE)
