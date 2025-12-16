# Dockerfile for sync server on Raspberry Pi
FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy server files
COPY server/*.ts ./

# Create directories for data persistence
RUN mkdir -p .rooms .assets

# Expose port
EXPOSE 5858

# Start sync server
CMD ["npx", "tsx", "./server.ts"]
