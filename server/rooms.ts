import { TLSocketRoom, RoomSnapshot } from '@tldraw/sync-core'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// For this example we're saving room snapshots to the local filesystem
const DIR = './.rooms'
mkdirSync(DIR, { recursive: true })

// Sanitize roomId to prevent path traversal attacks
function sanitizeRoomId(roomId: string): string {
	return roomId.replace(/[^a-zA-Z0-9_-]/g, '_')
}

// We'll keep an in-memory map of active rooms
const rooms = new Map<string, TLSocketRoom<any, void>>()

// Load room snapshot from disk
function loadRoomSnapshot(roomId: string): RoomSnapshot | undefined {
	const filePath = join(DIR, `${roomId}.json`)
	if (existsSync(filePath)) {
		try {
			const data = readFileSync(filePath, 'utf-8')
			return JSON.parse(data)
		} catch (error) {
			console.error('Error loading room snapshot:', error)
		}
	}
	return undefined
}

// Save room snapshot to disk
function saveRoomSnapshot(roomId: string, snapshot: RoomSnapshot) {
	const filePath = join(DIR, `${roomId}.json`)
	try {
		writeFileSync(filePath, JSON.stringify(snapshot), 'utf-8')
	} catch (error) {
		console.error('Error saving room snapshot:', error)
	}
}

export function makeOrLoadRoom(roomId: string): TLSocketRoom<any, void> {
	roomId = sanitizeRoomId(roomId)

	const existing = rooms.get(roomId)
	if (existing && !existing.isClosed()) {
		return existing
	}

	console.log('loading room', roomId)
	
	// Load existing snapshot if available
	const initialSnapshot = loadRoomSnapshot(roomId)

	const room = new TLSocketRoom({
		initialSnapshot,
		onSessionRemoved(room, args) {
			console.log('client disconnected', args.sessionId, roomId)
			if (args.numSessionsRemaining === 0) {
				console.log('closing room', roomId)
				// Save snapshot before closing
				const snapshot = room.getCurrentSnapshot()
				saveRoomSnapshot(roomId, snapshot)
				room.close()
				rooms.delete(roomId)
			}
		},
		onDataChange() {
			// Periodically save snapshot when data changes
			const snapshot = room.getCurrentSnapshot()
			saveRoomSnapshot(roomId, snapshot)
		}
	})

	rooms.set(roomId, room)
	return room
}
