# Draw - Collaborative Whiteboard

A simple, minimalist multiplayer whiteboard powered by [tldraw](https://tldraw.com).

Deploy frontend to **Vercel** and sync server to your **Raspberry Pi** via Docker.

## Features

- 🎨 **Full-featured drawing tools** - Pen, shapes, text, images, and more
- 👥 **Real-time multiplayer** - WebSocket sync server on your Raspberry Pi
- 🎯 **Minimalist UI** - Clean, modern interface that gets out of your way
- 🔗 **Easy sharing** - Each session gets a unique room ID in the URL
- ⚡ **Fast & responsive** - Built with Next.js and React
- 💾 **Persistent storage** - Room data and assets on your Raspberry Pi
- 🔖 **Bookmark unfurling** - Automatic preview generation for URLs
- 🏠 **Self-hosted backend** - Your data on your hardware

## Contributing

This project uses a two-branch development strategy with automated releases. 

**Quick Start:**
- Create feature branches from `dev`
- All PRs should target `dev`
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Release Please automatically creates release PRs from `dev` to `main`

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Local Development

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Note**: For local development, the app will need a sync server URL. You can either:
1. Deploy the sync server to your Raspberry Pi first (see Production below)
2. Or temporarily use a placeholder URL (multiplayer won't work without a real server)

**Configure Raspberry Pi Backend**

1. Create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Raspberry Pi sync server URL:
   ```bash
   NEXT_PUBLIC_SYNC_SERVER_URL=http://localhost:5858
   ```
   
   Or for production:
   ```bash
   NEXT_PUBLIC_SYNC_SERVER_URL=https://draw-sync.yourdomain.com
   ```

### Production Deployment

**Step 1: Deploy Sync Server to Raspberry Pi**

On your Raspberry Pi:
```bash
git clone https://github.com/virus-rpi/draw.git
cd draw
docker-compose up -d
```

Set up Cloudflare Tunnel:
```bash
cloudflared tunnel create draw-sync
cloudflared tunnel route dns draw-sync draw-sync.yourdomain.com
sudo cloudflared service install
```

**See [RASPBERRY_PI_SETUP.md](./RASPBERRY_PI_SETUP.md) for detailed instructions**

**Step 2: Deploy Frontend to Vercel**

1. Push to GitHub:
   ```bash
   git push origin main
   ```

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `NEXT_PUBLIC_SYNC_SERVER_URL=https://draw-sync.yourdomain.com`
   - Deploy

**See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed instructions**

**Why This Setup?**
- ✅ Your own hardware - full control
- ✅ No port forwarding needed
- ✅ Free Cloudflare tunnel
- ✅ Automatic HTTPS
- ✅ Data stays on your infrastructure
- ✅ Cost: ~$2-5/month (just Pi electricity)

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Vercel    │ ◄─────► │ Cloudflare Tunnel│ ◄─────► │  Raspberry Pi   │
│  (Frontend) │  HTTPS  │  (Public URL)    │   LAN   │  (Sync Server)  │
└─────────────┘         └──────────────────┘         └─────────────────┘
```

### Components

1. **Next.js Frontend** (`/app`, `/components`)
   - Deployed to Vercel
   - React-based UI with tldraw canvas
   - Connects to Raspberry Pi sync server

2. **Sync Server** (`/server`)
   - Deployed to Raspberry Pi via Docker
   - FastifyJS WebSocket server
   - SQLite room persistence
   - Exposed via Cloudflare Tunnel

3. **Next.js API Routes** (`/app/api`)
   - Deployed to Vercel
   - `/api/uploads/[id]` - Proxies asset requests to Raspberry Pi
   - `/api/unfurl` - Proxies unfurl requests to Raspberry Pi

### Tech Stack

**Frontend (Vercel)**
- Next.js 16 - React framework
- tldraw 4.2 - Canvas whiteboard
- TypeScript - Type safety
- Tailwind CSS - Styling

**Backend (Raspberry Pi)**
- Fastify - Web server
- SQLite - Room data storage
- Docker - Containerization
- Cloudflare Tunnel - Secure access

## Documentation

- **[RASPBERRY_PI_SETUP.md](./RASPBERRY_PI_SETUP.md)** - Complete guide for deploying sync server to Raspberry Pi
- **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** - Guide for deploying frontend to Vercel

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SYNC_SERVER_URL` | Your Raspberry Pi sync server URL (via Cloudflare Tunnel) | Yes |

## Data Persistence

- **Room Data**: JSON snapshots on your Raspberry Pi (permanent)
- **Assets**: Filesystem on your Raspberry Pi (permanent)
- **Your Control**: 100% of data on your infrastructure

## Security

- Room IDs generated using `crypto.randomUUID()`
- No authentication required - rooms accessible via URL
- Cloudflare Tunnel provides DDoS protection
- For production, consider adding authentication

## License

MIT
