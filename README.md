# Draw - Collaborative Whiteboard

A simple, minimalist multiplayer whiteboard powered by [tldraw](https://tldraw.com).

## Features

- 🎨 **Full-featured drawing tools** - Pen, shapes, text, images, and more
- 👥 **Multiplayer ready** - Real-time collaboration with custom sync server
- 🎯 **Minimalist UI** - Clean, modern interface that gets out of your way
- 🔗 **Easy sharing** - Each session gets a unique room ID in the URL
- ⚡ **Fast & responsive** - Built with Next.js and React
- 💾 **Asset support** - Upload and manage images, videos, and other media
- 🔖 **Bookmark unfurling** - Automatic preview generation for URLs

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

**Option 1: With Custom Sync Server (Local Development)**

Run both the sync server and Next.js client:

```bash
npm run dev
```

This will start:
- Sync server on `http://localhost:5858` (WebSocket + HTTP)
- Next.js app on `http://localhost:3000`

**Option 2: Client Only (Uses tldraw demo sync)**

Run just the Next.js client (uses tldraw's demo sync server):

```bash
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production

Build and start for production:

```bash
npm run build
npm start
```

## Architecture

### Components

1. **Next.js Frontend** (`/app`, `/components`)
   - React-based UI with tldraw canvas
   - Client-side room management
   - WebSocket connection to sync server

2. **Custom Sync Server** (`/server`)
   - FastifyJS-based WebSocket server
   - SQLite storage for room persistence
   - Asset upload/download endpoints
   - Bookmark unfurling service

3. **Next.js API Routes** (`/app/api`)
   - `/api/uploads/[id]` - Asset storage (works on Vercel)
   - `/api/unfurl` - Bookmark metadata fetching (works on Vercel)

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

The app is configured to work on Vercel out of the box:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configuration**
   - The app uses tldraw's demo sync server by default on Vercel
   - Assets and unfurling work through Next.js API routes
   - No additional configuration needed!

4. **(Optional) Use Custom Sync Server**
   
   If you want to use your own sync server instead of the demo:
   
   a. Deploy the sync server to Railway/Render/Fly.io:
      ```bash
      # Example for Railway
      railway init
      railway up
      ```
   
   b. Set environment variable in Vercel:
      - Go to Project Settings → Environment Variables
      - Add: `NEXT_PUBLIC_SYNC_SERVER_URL` = `https://your-sync-server.railway.app`

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

- **Rooms**: Stored in SQLite databases in `./.rooms` directory
- **Assets**: Stored in filesystem in `./.assets` directory
- **Note**: On Vercel, data is ephemeral. For production, use:
  - [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for assets
  - External sync server (Railway, Render) for rooms

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
