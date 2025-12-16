# Deploy to Vercel with Raspberry Pi Backend

Deploy your collaborative whiteboard frontend to Vercel and sync server to your Raspberry Pi.

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Vercel    │ ◄─────► │ Cloudflare Tunnel│ ◄─────► │  Raspberry Pi   │
│  (Frontend) │  HTTPS  │  (Public URL)    │   LAN   │  (Sync Server)  │
└─────────────┘         └──────────────────┘         └─────────────────┘
```

## Why This Setup?

✅ **Cost-Effective** - ~$2-5/month (just Pi power)
✅ **Full Control** - Your data on your hardware  
✅ **No Port Forwarding** - Cloudflare Tunnel handles access
✅ **Free Frontend Hosting** - Vercel hobby plan
✅ **Automatic HTTPS** - Built into Cloudflare Tunnel

## Quick Start

### Step 1: Deploy Sync Server to Raspberry Pi

**See [RASPBERRY_PI_SETUP.md](./RASPBERRY_PI_SETUP.md) for detailed instructions.**

Quick version:
```bash
# On your Raspberry Pi
git clone https://github.com/virus-rpi/draw.git
cd draw
docker-compose up -d

# Set up Cloudflare Tunnel
cloudflared tunnel create draw-sync
cloudflared tunnel route dns draw-sync draw-sync.yourdomain.com
sudo cloudflared service install
```

### Step 2: Deploy Frontend to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Add Environment Variable**
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SYNC_SERVER_URL` = `https://draw-sync.yourdomain.com`
   - Redeploy

4. **Done!** Your app is live.

## What You Get

✅ **Drawing & Collaboration** - Full tldraw functionality  
✅ **Real-time Multiplayer** - Your own sync server on Raspberry Pi
✅ **Persistent Asset Storage** - Files stored on your Raspberry Pi
✅ **Persistent Room Data** - JSON snapshots on your Raspberry Pi
✅ **Bookmark Previews** - Automatic URL unfurling  
✅ **Automatic HTTPS** - Via Cloudflare Tunnel
✅ **Fast Frontend** - Hosted on Vercel's global CDN

## Configuration

All backend functionality runs on your Raspberry Pi. The Vercel frontend simply proxies API requests to your Pi.

Create `.env.local` for local development:
```bash
NEXT_PUBLIC_SYNC_SERVER_URL=http://localhost:5858
```

For production, set in Vercel:
```bash
NEXT_PUBLIC_SYNC_SERVER_URL=https://draw-sync.yourdomain.com
```



## Environment Variables

Set in Vercel project settings:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SYNC_SERVER_URL` | `https://draw-sync.yourdomain.com` | Yes |

## Troubleshooting

### Multiplayer Not Working

1. Check Raspberry Pi: `docker-compose ps`
2. Check Cloudflare Tunnel: `sudo systemctl status cloudflared`
3. Test connectivity: `curl https://draw-sync.yourdomain.com`
4. Verify Vercel env var is set correctly

### Assets Don't Upload

1. Check Raspberry Pi is running: `docker-compose ps`
2. Verify sync server URL is correct in Vercel env vars
3. Check Raspberry Pi logs: `docker-compose logs -f`

### Build Fails on Vercel

- Node.js 18+ is required (set in Vercel project settings)
- Check build logs for specific errors

## Cost Estimate

- **Vercel**: Free (hobby plan)
- **Raspberry Pi**: ~$2-5/month (electricity)
- **Cloudflare Tunnel**: Free
- **Total**: ~$2-5/month

## Need Help?

- Detailed Pi setup: [RASPBERRY_PI_SETUP.md](./RASPBERRY_PI_SETUP.md)
- Issues: [GitHub](https://github.com/virus-rpi/draw/issues)
- tldraw docs: [tldraw.dev](https://tldraw.dev)
