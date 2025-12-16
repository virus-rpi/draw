const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { WebSocketServer } = require('ws')
const { TLSocketRoom } = require('@tldraw/sync-core')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// In-memory room storage (for demo - use database in production)
const rooms = new Map()

function makeOrLoadRoom(roomId) {
  const existing = rooms.get(roomId)
  if (existing && !existing.isClosed()) {
    return existing
  }

  console.log('Creating room:', roomId)
  const room = new TLSocketRoom({
    // Use in-memory storage for now
    onSessionRemoved(room, args) {
      console.log('Client disconnected', args.sessionId, roomId)
      if (args.numSessionsRemaining === 0) {
        console.log('Closing room', roomId)
        room.close()
        rooms.delete(roomId)
      }
    },
  })

  rooms.set(roomId, room)
  return room
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create WebSocket server
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (request, socket, head) => {
    const { pathname, query } = parse(request.url, true)
    
    // Handle /connect/:roomId WebSocket connections
    const match = pathname.match(/^\/connect\/([^\/]+)$/)
    if (match) {
      const roomId = match[1]
      const sessionId = query.sessionId

      wss.handleUpgrade(request, socket, head, (ws) => {
        const room = makeOrLoadRoom(roomId)
        
        // Adapt ws to the expected interface
        const adaptedSocket = {
          ...ws,
          send: (data) => {
            if (ws.readyState === 1) { // OPEN
              ws.send(data)
            }
          },
          on: (event, handler) => {
            ws.on(event, handler)
          },
          off: (event, handler) => {
            ws.off(event, handler)
          },
          close: () => ws.close()
        }

        room.handleSocketConnect({ sessionId, socket: adaptedSocket })
      })
    } else {
      socket.destroy()
    }
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket server ready for /connect/:roomId`)
  })
})
