# Draw - Collaborative Whiteboard

A simple, minimalist multiplayer whiteboard powered by [tldraw](https://tldraw.com) with **integrated WebSocket sync server**.

## Features

- 🎨 **Full-featured drawing tools** - Pen, shapes, text, images, and more
- 👥 **Real-time multiplayer** - Integrated WebSocket server for live collaboration
- 🎯 **Minimalist UI** - Clean, modern interface that gets out of your way
- 🔗 **Easy sharing** - Each session gets a unique room ID in the URL
- ⚡ **Fast & responsive** - Built with Next.js and React
- 💾 **Persistent storage** - Vercel Blob for assets, SQLite for rooms
- 🔖 **Bookmark unfurling** - Automatic preview generation for URLs
- 🚀 **One-command deployment** - Automated Vercel + Railway setup

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

**Quick Start**

```bash
# Install dependencies
npm install

# Start integrated server (Next.js + WebSocket sync)
npm run dev
```

This starts the integrated server with:
- Next.js app on `http://localhost:3000`
- WebSocket sync server on the same port
- In-memory room storage

Open [http://localhost:3000](http://localhost:3000) with your browser.

**Optional: Enable Asset Uploads Locally**

For asset uploads to work in local development:

1. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Vercel Blob token:
   - Deploy to Vercel first (or create a project)
   - Go to: Vercel Dashboard → Your Project → Storage → Blob
   - Copy the `BLOB_READ_WRITE_TOKEN`
   - Add it to `.env.local`

### Production

**Vercel Deployment with Integrated Sync Server**

The app uses an integrated sync server architecture. For Vercel, we deploy in two parts:

**Automated Deployment (One Command)**

```bash
./scripts/deploy-to-vercel.sh
```

This script automatically:
1. Deploys sync server to Railway (free tier)
2. Deploys frontend to Vercel
3. Connects them with environment variables

**Option 1: Railway Deployment**

1. **Deploy Sync Server to Railway:**
   ```bash
   railway login
   railway init
   railway up
   ```

2. **Deploy Frontend to Vercel:**
   - Push to GitHub
   - Import to Vercel
   - Add environment variable: `NEXT_PUBLIC_SYNC_SERVER_URL` = your Railway URL
   - Deploy

**Option 2: Raspberry Pi + Cloudflare Tunnel** 🆕

Run the sync server on your Raspberry Pi and expose it via Cloudflare Tunnel:

1. **Deploy sync server on Raspberry Pi:**
   ```bash
   docker-compose up -d
   ```

2. **Set up Cloudflare Tunnel:**
   ```bash
   cloudflared tunnel create draw-sync
   cloudflared tunnel route dns draw-sync draw-sync.yourdomain.com
   ```

3. **Configure Vercel:**
   - Set `NEXT_PUBLIC_SYNC_SERVER_URL` = `https://draw-sync.yourdomain.com`

**See [RASPBERRY_PI_SETUP.md](./RASPBERRY_PI_SETUP.md) for complete guide**

**Benefits:**
- ✅ Your own hardware - full control
- ✅ No port forwarding needed
- ✅ Free Cloudflare tunnel
- ✅ Automatic HTTPS
- ✅ Data stays on your infrastructure

**Self-Hosted (Integrated Server)**

For traditional hosting, everything runs together:

```bash
npm run build
npm start
```

This runs Next.js and WebSocket server on the same port (no separate deployment needed).

## Architecture

### Integrated Server Design

This app features an **integrated WebSocket sync server** that handles real-time collaboration:

**For Self-Hosted / Local Development:**
- `server.js` - Custom Next.js server with integrated WebSocket support
- Runs Next.js app and WebSocket server on single port
- In-memory room storage (or SQLite via `/server` directory)
- One command to start everything: `npm run dev`

**For Vercel Deployment:**
- Frontend: Deployed to Vercel (serverless)
- Sync Server: Choose one:
  - **Railway** (cloud hosting)
  - **Raspberry Pi + Cloudflare Tunnel** (your hardware) 🆕
- Connected via `NEXT_PUBLIC_SYNC_SERVER_URL` environment variable
- Automated Railway deployment: `./scripts/deploy-to-vercel.sh`
- Raspberry Pi setup: See [RASPBERRY_PI_SETUP.md](./RASPBERRY_PI_SETUP.md)

### Components

1. **Integrated Server** (`server.js`)
   - Next.js custom server
   - WebSocket server for sync
   - Single port for HTTP + WebSocket

2. **Next.js Frontend** (`/app`, `/components`)
   - React-based UI with tldraw canvas
   - Automatic WebSocket connection
   - Client-side room management

3. **Sync Server** (`/server`)
   - FastifyJS WebSocket server (for Railway deployment)
   - SQLite room persistence
   - Used when deploying sync server separately

4. **Next.js API Routes** (`/app/api`)
   - `/api/uploads/[id]` - Asset storage using Vercel Blob
   - `/api/unfurl` - Bookmark metadata fetching

### Deployment Options Comparison

| Method | Pros | Cons | Cost |
|--------|------|------|------|
| **Self-Hosted** | Full control, simple setup | Requires server | Server cost |
| **Railway** | Easy, managed, free tier | Limited free tier | $0-5/month |
| **Raspberry Pi + Cloudflare** | Own hardware, private, free tunnel | Initial setup, maintain Pi | $2-5/month (power) |

### Why Separate Sync Server for Vercel?

- **Vercel limitation**: No WebSocket support in serverless
- **Solution**: Deploy sync server to Railway (supports WebSockets)
- **Self-hosted**: Use integrated server (no separation needed)

### Tech Stack

- **Next.js 16** - React framework with App Router
- **tldraw 4.2** - Infinite canvas whiteboard
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Fastify** - High-performance web framework
- **SQLite** - Local database for room persistence
- **better-sqlite3** - Synchronous SQLite bindings

## Deployment

### Deploy to Vercel (Recommended)

**Zero Configuration Deployment**

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Done!** ✅
   - Multiplayer collaboration works automatically (via demo sync)
   - Asset uploads work automatically (via Vercel Blob)
   - No environment variables required
   - No additional configuration needed

**What Works Automatically:**
- ✅ Drawing and collaboration
- ✅ Persistent asset storage (Vercel Blob)
- ✅ Bookmark unfurling
- ✅ Room-based sessions (24h retention via demo sync)

**Advanced: Custom Sync Server (Optional)**

If you need persistent room storage beyond 24 hours:

1. Deploy the sync server from `/server` to Railway/Render/Fly.io
2. Set `NEXT_PUBLIC_SYNC_SERVER_URL` in Vercel environment variables
3. Redeploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Deploy Sync Server Separately

If you need persistent storage and want your own sync server:

**Option 1: Railway**
1. Create a new project on [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set the start command: `npm run start:server`
4. Deploy

**Option 2: Render**
1. Create a new Web Service on [render.com](https://render.com)
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm run start:server`
5. Deploy

**Option 3: Fly.io**
```bash
fly launch
fly deploy
```

### Self-Hosted Deployment

Deploy both frontend and sync server:

```bash
# Build the Next.js app
npm run build

# Start both servers
npm start
```

Or use Docker:

```bash
# Coming soon
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SYNC_SERVER_URL` | Custom sync server URL | tldraw demo server | No |

## Data Persistence

- **Rooms**: 
  - Local dev: Stored in SQLite databases in `./.rooms` directory
  - Vercel: Uses tldraw demo sync server (temporary, 24h retention)
  - Production: Deploy custom sync server to Railway/Render
  
- **Assets**: 
  - **Vercel Blob Storage** - Persistent storage using [@vercel/blob](https://vercel.com/docs/storage/vercel-blob)
  - Automatically enabled on Vercel deployments
  - For local dev, set `BLOB_READ_WRITE_TOKEN` in `.env.local`

## Known Issues

- Some dev dependencies (eslint-config-next) have vulnerability warnings. These only affect development and don't impact production security.
- The tldraw library (v2.4.x) has some transitive dependencies with moderate vulnerabilities. Consider upgrading to tldraw v4 when it becomes stable.

## Security

- Room IDs are generated using `crypto.randomUUID()` for cryptographic security
- No authentication is required - rooms are accessible to anyone with the URL
- Data is not persisted beyond the session
- For production use with data persistence, implement proper authentication and authorization

## License

MIT
