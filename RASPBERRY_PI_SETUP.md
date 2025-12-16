# Deploy Sync Server on Raspberry Pi with Cloudflare Tunnel

This guide shows you how to run the sync server on your Raspberry Pi and expose it to your Vercel frontend via Cloudflare Tunnel.

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Vercel    │ ◄─────► │ Cloudflare Tunnel│ ◄─────► │  Raspberry Pi   │
│  (Frontend) │  HTTPS  │  (Public URL)    │   LAN   │  (Sync Server)  │
└─────────────┘         └──────────────────┘         └─────────────────┘
```

**Benefits:**
- ✅ No port forwarding needed
- ✅ Automatic HTTPS via Cloudflare
- ✅ Free tier available
- ✅ Your data stays on your hardware
- ✅ DDoS protection included

## Prerequisites

- Raspberry Pi (3B+ or newer recommended)
- Docker installed on Raspberry Pi
- Cloudflare account (free tier works)
- Domain name (or use Cloudflare's provided subdomain)

## Step 1: Install Docker on Raspberry Pi

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

Log out and back in for group changes to take effect.

## Step 2: Clone Repository on Raspberry Pi

```bash
# Clone your repository
git clone https://github.com/virus-rpi/draw.git
cd draw

# Create data directories
mkdir -p data/rooms data/assets
```

## Step 3: Build and Run Docker Container

```bash
# Build the Docker image
docker-compose build

# Start the sync server
docker-compose up -d

# Check if it's running
docker-compose ps
docker-compose logs -f
```

The sync server should now be running on `http://localhost:5858`

## Step 4: Set Up Cloudflare Tunnel

### Install Cloudflared

```bash
# Download cloudflared for ARM64 (Raspberry Pi 4)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64

# Or for ARMv7 (Raspberry Pi 3)
# wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm

# Make it executable
chmod +x cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared

# Verify installation
cloudflared --version
```

### Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser - select your domain and authorize.

### Create a Tunnel

```bash
# Create a new tunnel
cloudflared tunnel create draw-sync

# This creates a credentials file at:
# ~/.cloudflared/<TUNNEL-ID>.json
```

### Configure the Tunnel

Create configuration file:

```bash
nano ~/.cloudflared/config.yml
```

Add this configuration:

```yaml
tunnel: draw-sync
credentials-file: /home/pi/.cloudflared/<TUNNEL-ID>.json

ingress:
  # Route websocket traffic to your sync server
  - hostname: draw-sync.yourdomain.com
    service: http://localhost:5858
    originRequest:
      noTLSVerify: true
  
  # Catch-all rule (required)
  - service: http_status:404
```

Replace:
- `<TUNNEL-ID>` with your actual tunnel ID
- `draw-sync.yourdomain.com` with your desired subdomain

### Create DNS Record

```bash
cloudflared tunnel route dns draw-sync draw-sync.yourdomain.com
```

### Run the Tunnel

**Option 1: Run in foreground (testing)**
```bash
cloudflared tunnel run draw-sync
```

**Option 2: Run as a service (recommended)**
```bash
# Install as system service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

## Step 5: Configure Vercel

Add environment variable to your Vercel project:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - **Name**: `NEXT_PUBLIC_SYNC_SERVER_URL`
   - **Value**: `https://draw-sync.yourdomain.com`
4. Redeploy your Vercel app

## Step 6: Test the Setup

1. Open your Vercel app: `https://your-app.vercel.app`
2. Create a drawing
3. Open the same URL in another browser/device
4. Both should sync in real-time!

## Troubleshooting

### Check Sync Server Logs

```bash
docker-compose logs -f
```

### Check Cloudflare Tunnel Status

```bash
sudo systemctl status cloudflared
cloudflared tunnel info draw-sync
```

### Test Connectivity

```bash
# From your Raspberry Pi
curl http://localhost:5858

# From anywhere
curl https://draw-sync.yourdomain.com
```

### Common Issues

**Issue: Tunnel not connecting**
```bash
# Restart the tunnel
sudo systemctl restart cloudflared

# Check logs
sudo journalctl -u cloudflared -f
```

**Issue: WebSocket connection failed**
- Ensure Cloudflare Proxy is enabled (orange cloud)
- Verify the tunnel hostname matches your DNS record
- Check that port 5858 is exposed in docker-compose.yml

**Issue: Room data lost after restart**
- Verify volume mounts in docker-compose.yml
- Check permissions: `sudo chown -R $USER:$USER data/`

## Updating the Sync Server

```bash
# Pull latest changes
cd ~/draw
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## Monitoring

### View Live Logs
```bash
docker-compose logs -f
```

### Check Resource Usage
```bash
docker stats draw-sync-server
```

### Auto-restart on Failure
The `restart: unless-stopped` policy in docker-compose.yml ensures the server automatically restarts.

## Security Best Practices

1. **Cloudflare WAF**: Enable Web Application Firewall in Cloudflare dashboard
2. **Rate Limiting**: Configure in Cloudflare to prevent abuse
3. **Access Control**: Use Cloudflare Access for authentication (optional)
4. **Regular Updates**: Keep Docker images and system packages updated

## Cost Breakdown

- Raspberry Pi: One-time cost (~$50-100)
- Power consumption: ~$2-5/month
- Cloudflare Tunnel: **Free**
- Vercel: **Free** (hobby plan)

**Total monthly cost: ~$2-5**

## Advanced: Multiple Tunnels

If you want high availability, you can run multiple Raspberry Pis with load balancing:

```yaml
# On Pi #1
tunnel: draw-sync-1
ingress:
  - hostname: draw-sync.yourdomain.com
    service: http://localhost:5858

# On Pi #2  
tunnel: draw-sync-2
ingress:
  - hostname: draw-sync.yourdomain.com
    service: http://localhost:5858
```

Cloudflare automatically load balances between active tunnels.

## Alternative: Using Cloudflare's Free Subdomain

If you don't have a domain, you can use Cloudflare's provided subdomain:

```bash
# After creating tunnel, use the provided URL
cloudflared tunnel create draw-sync
# Note the provided *.cfargotunnel.com URL

# Use this URL in Vercel:
# NEXT_PUBLIC_SYNC_SERVER_URL=https://your-tunnel.cfargotunnel.com
```

## Support

For issues:
1. Check Raspberry Pi logs: `docker-compose logs -f`
2. Check Cloudflare Tunnel: `sudo journalctl -u cloudflared -f`
3. Test locally first: `curl http://localhost:5858`
4. Verify Vercel environment variable is set correctly
