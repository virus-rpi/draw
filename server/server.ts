import cors from '@fastify/cors'
import websocketPlugin from '@fastify/websocket'
import fastify from 'fastify'
import type { RawData } from 'ws'
import { loadAsset, storeAsset } from './assets'
import { makeOrLoadRoom } from './rooms'
import { unfurl } from './unfurl'
import { getAllLockedColors, getUserLockedColor, lockColor, unlockColor } from './colorLocks'

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

    app.addContentTypeParser('application/json', {parseAs: 'string'}, ( req, body, done ) => {
        try {
            const json = JSON.parse(body as string)
            done(null, json)
        } catch (err: any) {
            err.statusCode = 400
            done(err, undefined)
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

    app.post('/color-lock/:roomId', async ( req, res ) => {
        const roomId = (req.params as any).roomId as string
        const {color, userId, password} = req.body as { color: string; userId: string; password: string }

        if (!color || !userId || !password) {
            res.code(400)
            return {success: false, message: 'Missing required fields: color, userId, password'}
        }

        const result = lockColor(roomId, color, userId, password)
        res.code(result.success ? 200 : 400)
        return result
    })

    app.post('/color-unlock/:roomId', async ( req, res ) => {
        const roomId = (req.params as any).roomId as string
        const {color, userId, password} = req.body as { color: string; userId: string; password: string }

        if (!color || !userId || !password) {
            res.code(400)
            return {success: false, message: 'Missing required fields: color, userId, password'}
        }

        const result = unlockColor(roomId, color, userId, password)
        res.code(result.success ? 200 : 400)
        return result
    })

    app.get('/color-locks/:roomId', async ( req, res ) => {
        const roomId = (req.params as any).roomId as string
        const locks = getAllLockedColors(roomId)
        return {locks}
    })

    app.get('/user-locked-color/:roomId/:userId', async ( req, res ) => {
        const roomId = (req.params as any).roomId as string
        const userId = (req.params as any).userId as string
        const lockedColor = getUserLockedColor(roomId, userId)
        return {color: lockedColor || null}
    })

    app.get('/color-locks-ws/:roomId', {websocket: true}, async ( socket, req ) => {
        const roomId = (req.params as any).roomId as string
        console.log(`Color lock WebSocket connection to room ${roomId}`)

        try {
            const locks = getAllLockedColors(roomId)
            socket.send(JSON.stringify({type: 'color-lock-update', locks}))
        } catch (error) {
            console.error('Failed to send initial color lock state:', error)
        }

        const interval = setInterval(() => {
            try {
                const locks = getAllLockedColors(roomId)
                socket.send(JSON.stringify({type: 'color-lock-update', locks}))
            } catch (error) {
                clearInterval(interval)
            }
        }, 1000)

        socket.on('close', () => {
            console.log(`Color lock WebSocket disconnected from room ${roomId}`)
            clearInterval(interval)
        })

        socket.on('error', ( error ) => {
            console.error(`Color lock WebSocket error for room ${roomId}:`, error)
            clearInterval(interval)
        })
    })
})

app.listen({port: PORT, host: '0.0.0.0'}, ( err ) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log(`Server started on port ${PORT}`)
})
