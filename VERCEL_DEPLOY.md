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
✅ **Persistent Asset Storage** - Vercel Blob for images/files  
✅ **Persistent Room Data** - SQLite on your Raspberry Pi
✅ **Bookmark Previews** - Automatic URL unfurling  
✅ **Automatic HTTPS** - Via Cloudflare Tunnel
✅ **Global CDN** - Fast frontend loading via Vercel

## Vercel Blob Storage

Vercel Blob is automatically provisioned when you deploy to Vercel:

1. **Automatic Setup** - No configuration needed
2. **Environment Variable** - `BLOB_READ_WRITE_TOKEN` is auto-set by Vercel
3. **For Local Dev** - Get token from: Vercel Dashboard → Storage → Blob → Connect

Create `.env.local`:
```bash
BLOB_READ_WRITE_TOKEN=your_token_from_vercel
NEXT_PUBLIC_SYNC_SERVER_URL=https://draw-sync.yourdomain.com
```



## Environment Variables

Set in Vercel project settings:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SYNC_SERVER_URL` | `https://draw-sync.yourdomain.com` | Yes |
| `BLOB_READ_WRITE_TOKEN` | Auto-set by Vercel | Auto |

## Troubleshooting

### Multiplayer Not Working

1. Check Raspberry Pi: `docker-compose ps`
2. Check Cloudflare Tunnel: `sudo systemctl status cloudflared`
3. Test connectivity: `curl https://draw-sync.yourdomain.com`
4. Verify Vercel env var is set correctly

### Assets Don't Upload

1. Ensure Vercel Blob is enabled (automatic on deploy)
2. Check Vercel logs for errors
3. File size limit: 4.5MB per file

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
