# Dockerfile for sync server on Raspberry Pi
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files
COPY server ./server

# Create directories for data persistence
RUN mkdir -p .rooms .assets

# Expose port
EXPOSE 5858

# Start sync server
CMD ["npx", "tsx", "./server/server.ts"]
