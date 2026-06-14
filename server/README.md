# Twin WebSocket Server

This is the standalone WebSocket server for the Twin application, extracted from the Next.js backend.
It is built using Express and Socket.io to seamlessly integrate with the existing Next.js frontend logic.

## How to run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001` by default.

## Required Environment Variables

When deploying to Render (or any other hosting service), ensure the following environment variables are set:

- `PORT`: (Optional) The port to bind to. Default is `3001`. Render sets this automatically.
- `CORS_ORIGIN`: Your frontend URL, e.g., `https://twin-l3hf.vercel.app`. This is crucial for cross-origin socket connections.

## Connecting from the Frontend

Your Next.js frontend connects using the `socket.io-client` library. To connect to this standalone server, set the following environment variable in your Next.js `.env.local` or Vercel project settings:

```
NEXT_PUBLIC_WS_URL=https://your-render-app.onrender.com
```

> **Note:** Even though it's WebSockets, Socket.io uses HTTP/HTTPS for the initial handshake and upgrades to `ws/wss` automatically. Therefore, use `http://` or `https://` in the connection URL instead of `ws://` or `wss://`.
