FROM node:18-alpine

WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/*.ts ./
RUN mkdir -p .rooms .assets
EXPOSE 5858
CMD ["npx", "tsx", "./server.ts"]
