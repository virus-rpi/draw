import cors from '@fastify/cors'
import websocketPlugin from '@fastify/websocket'
import fastify from 'fastify'
import type { RawData } from 'ws'
import { loadAsset, storeAsset } from './assets'
import { makeOrLoadRoom } from './rooms'
import { unfurl } from './unfurl'

const PORT = parseInt(process.env.PORT || '5858', 10)

const app = fastify()
app.register(websocketPlugin)
app.register(cors, {origin: '*'})

app.register(async ( app ) => {
    app.get('/connect/:roomId', {websocket: true}, async ( socket, req ) => {
        const roomId = (req.params as any).roomId as string
        const sessionId = (req.query as any)?.['sessionId'] as string
        console.log(`New connection to room ${roomId} with sessionId ${sessionId}`)

        const caughtMessages: RawData[] = []
        const MAX_CAUGHT_MESSAGES = 100

        const collectMessagesListener = ( message: RawData ) => {
            if (caughtMessages.length < MAX_CAUGHT_MESSAGES) {
                caughtMessages.push(message)
            }
        }

        socket.on('message', collectMessagesListener)

        const room = makeOrLoadRoom(roomId)
        room.handleSocketConnect({sessionId, socket})

        socket.off('message', collectMessagesListener)

        for (const message of caughtMessages) {
            socket.emit('message', message)
        }
    })

    app.addContentTypeParser('*', ( _, payload, done ) => done(null))

    app.put('/uploads/:id', async ( req, res ) => {
        const id = (req.params as any).id as string
        await storeAsset(id, req.raw)
        return {ok: true}
    })
    app.get('/uploads/:id', async ( req, res ) => {
        const id = (req.params as any).id as string
        const data = await loadAsset(id)
        res.send(data)
    })

    app.get('/unfurl', async ( req, res ) => {
        const url = (req.query as any).url as string
        res.send(await unfurl(url))
    })

    app.get('/health', async ( req, res ) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        }
    })
})

app.listen({port: PORT, host: '0.0.0.0'}, ( err ) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log(`Server started on port ${PORT}`)
})
