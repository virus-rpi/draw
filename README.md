# Draw - Collaborative Whiteboard

A simple, minimalist multiplayer whiteboard powered by [tldraw](https://tldraw.com).

## Features

- 🎨 **Full-featured drawing tools** - Pen, shapes, text, images, and more
- 👥 **Multiplayer ready** - Built with tldraw sync for real-time collaboration
- 🎯 **Minimalist UI** - Clean, modern interface that gets out of your way
- 🔗 **Easy sharing** - Each session gets a unique room ID in the URL
- ⚡ **Fast & responsive** - Built with Next.js and React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Usage

1. Open the app - a unique room ID will be generated automatically
2. Share the URL with others to collaborate in real-time
3. Start drawing!

Each room persists for the duration of the session. To join an existing room, simply use the same URL with the room parameter.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **tldraw** - Infinite canvas whiteboard
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

## Deployment

This app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended) - Zero configuration deployment
- **Netlify** - Automatic builds and deployments
- **Railway** - Simple container-based hosting
- **Self-hosted** - Docker or Node.js server

### Environment Considerations

The application uses tldraw's demo sync server for real-time collaboration. For production use, consider:
- Setting up your own sync server using [@tldraw/sync](https://www.npmjs.com/package/@tldraw/sync)
- Or deploying with PartyKit for serverless real-time sync

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
