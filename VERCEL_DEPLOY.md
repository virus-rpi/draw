# Quick Deploy to Vercel

This guide provides the fastest path to deploy your Draw app to Vercel.

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/virus-rpi/draw)

Click the button above to deploy directly to Vercel.

## Manual Deploy

### Step 1: Push to GitHub

```bash
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Deploy"

That's it! Your app is now live.

## What Works Out of the Box

✅ **Drawing & Collaboration** - Full tldraw functionality  
✅ **Multiplayer Sync** - Real-time collaboration via tldraw demo server  
✅ **Asset Uploads** - Images and files via Next.js API routes  
✅ **Bookmark Previews** - Automatic URL unfurling  
✅ **Automatic SSL** - HTTPS enabled by default  
✅ **Global CDN** - Fast loading worldwide  

## Important Notes

### Data Persistence

⚠️ **Default Behavior**: The app uses tldraw's demo sync server, which:
- Stores room data temporarily (deleted after ~24 hours)
- Is shared publicly with all tldraw demo users
- Is perfect for testing and demos
- Not recommended for production use with sensitive data

### Asset Storage

⚠️ **Default Behavior**: Assets are stored in Vercel's ephemeral filesystem, which means:
- Files are temporarily stored during a request
- Not persistent across deployments
- Suitable for testing

## Upgrade to Production

For production use with persistent storage:

### Option 1: Custom Sync Server (Recommended)

Deploy your own sync server for data persistence:

1. **Deploy Sync Server** (Free on Railway)
   
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Configure Vercel Environment Variable**
   
   In your Vercel project:
   - Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SYNC_SERVER_URL` = `https://your-app.railway.app`
   - Redeploy

### Option 2: Vercel Blob Storage

Use Vercel's blob storage for persistent assets:

```bash
# Install Vercel CLI
npm i -g vercel

# Create blob storage
vercel link
vercel blob create production
```

Then update `/app/api/uploads/[id]/route.ts` to use Vercel Blob.

See [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)

## Custom Domain

After deployment, add your custom domain:

1. Go to your project in Vercel
2. Settings → Domains
3. Add your domain
4. Update DNS records as shown

## Environment Variables

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_SYNC_SERVER_URL` | Custom sync server URL | No | tldraw demo server |

## Troubleshooting

### Build Fails

Check that:
- Node.js version is 18+ in Vercel settings
- All dependencies are listed in `package.json`

### App Loads but Drawing Doesn't Work

Check browser console for errors. Most commonly:
- CORS issues (if using custom sync server)
- WebSocket connection blocked

### Assets Don't Upload

Check:
- File size limits (Vercel has 4.5MB body limit)
- Browser console for specific errors

## Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide
- Open an issue on [GitHub](https://github.com/virus-rpi/draw/issues)
- Review [tldraw documentation](https://tldraw.dev)

## Cost Estimate

- **Hobby**: Free (Vercel free tier + tldraw demo sync)
- **Production**: $5-20/month (Vercel Pro + Railway/Render sync server)
