# Deployment Guide

This guide covers different deployment options for the Draw collaborative whiteboard.

## Quick Deploy to Vercel (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/virus-rpi/draw)

### What Works Out of the Box

When you deploy to Vercel without any configuration:

✅ **Frontend** - Full Next.js app with drawing functionality  
✅ **Asset Uploads** - Images and files via Next.js API routes  
✅ **Bookmark Unfurling** - URL previews via Next.js API routes  
✅ **Multiplayer Sync** - Uses tldraw's demo sync server  

### Limitations on Vercel (Default)

⚠️ **Ephemeral Storage** - Uploaded assets are stored temporarily  
⚠️ **Demo Sync Server** - Uses tldraw's public demo server (data deleted after 24h)  

### Upgrading for Production

For a production deployment on Vercel, you have two options:

#### Option A: External Sync Server (Recommended)

Deploy your own sync server for persistent multiplayer rooms:

1. **Deploy Sync Server to Railway** (free tier available)
   
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and initialize
   railway login
   railway init
   
   # Deploy (this will use the existing server code)
   railway up
   ```

2. **Get Your Server URL**
   
   After deployment, Railway will give you a URL like:
   ```
   https://your-app.railway.app
   ```

3. **Configure Vercel**
   
   In your Vercel project:
   - Go to Settings → Environment Variables
   - Add variable:
     - Name: `NEXT_PUBLIC_SYNC_SERVER_URL`
     - Value: `https://your-app.railway.app`
   - Redeploy

#### Option B: Upgrade Storage (Keep Demo Sync)

Use Vercel's blob storage for persistent assets:

1. **Enable Vercel Blob Storage**
   
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Link project and create blob storage
   vercel link
   vercel blob create production
   ```

2. **Update API Routes**
   
   Modify `/app/api/uploads/[id]/route.ts` to use Vercel Blob instead of filesystem.
   
   See: [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)

## Deploy to Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Deploy**
   - Click "Deploy site"

**Note**: Same limitations as Vercel apply (no persistent storage, uses demo sync).

## Deploy Sync Server Separately

### Railway (Recommended - Free Tier)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up

# Set start command in railway.json
echo '{"build": {"builder": "NIXPACKS"}, "deploy": {"startCommand": "npm run start:server"}}' > railway.json

# Deploy again
railway up
```

### Render (Free Tier Available)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Name**: draw-sync-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:server`
   - **Port**: 5858
4. Click "Create Web Service"

### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app configuration
fly launch

# Deploy
fly deploy
```

Create `fly.toml`:
```toml
app = "draw-sync-server"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "5858"

[[services]]
  internal_port = 5858
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

## Docker Deployment

Coming soon! Full Docker support for easy self-hosting.

## Self-Hosted (VPS)

Deploy to your own server with PM2:

```bash
# On your server
git clone https://github.com/virus-rpi/draw
cd draw
npm install
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "draw-client" -- run start:client
pm2 start npm --name "draw-server" -- run start:server

# Save PM2 configuration
pm2 save
pm2 startup
```

## Environment Variables Reference

### Frontend (Next.js)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SYNC_SERVER_URL` | WebSocket sync server URL | No | tldraw demo server |

Example:
```bash
NEXT_PUBLIC_SYNC_SERVER_URL=https://your-sync-server.railway.app
```

### Sync Server

No environment variables required. The server uses:
- Port: `5858` (hardcoded, can be modified in `server/server.ts`)
- Storage: `./.rooms` for SQLite databases
- Assets: `./.assets` for uploaded files

## Troubleshooting

### Issue: Assets not persisting on Vercel

**Solution**: Vercel has ephemeral filesystem. Use Vercel Blob or external storage service.

### Issue: Multiplayer not working

**Solution**: Check that WebSocket connection is established:
1. Open browser DevTools → Network tab
2. Filter by "WS"
3. Should see connection to sync server

### Issue: Sync server not accessible

**Solution**: Ensure:
1. Server is running and accessible
2. Firewall allows port 5858
3. HTTPS is configured if using secure WebSocket (wss://)
4. CORS is enabled (already configured in server)

### Issue: Room data lost

**Solution**: 
- Local: Check `./.rooms` directory exists and has write permissions
- Production: Deploy sync server to persistent hosting (Railway, Render, VPS)

## Cost Estimate

### Free Tier (Good for Testing)

- **Vercel**: Free tier includes 100GB bandwidth
- **Railway**: $5 credit monthly (enough for small usage)
- **Render**: Free tier with 750 hours/month

### Paid (Production)

- **Vercel Pro**: $20/month (team features, better limits)
- **Railway**: Pay-as-you-go (~$5-10/month for small app)
- **Render**: $7/month (persistent server)
- **VPS (DigitalOcean, Linode)**: $5-10/month

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/virus-rpi/draw/issues)
- Check [tldraw documentation](https://tldraw.dev)
