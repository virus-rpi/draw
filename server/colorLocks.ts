import { createHash } from 'crypto'

export interface ColorLock {
    color: string
    userId: string
    passwordHash: string
    timestamp: number
}

export interface ColorLockState {
    locks: Map<string, ColorLock>
}

const roomColorLocks = new Map<string, ColorLockState>()

export function getRoomColorLocks( roomId: string ): ColorLockState {
    if (!roomColorLocks.has(roomId)) {
        roomColorLocks.set(roomId, {locks: new Map()})
    }
    return roomColorLocks.get(roomId)!
}

export function hashPassword( password: string ): string {
    return createHash('sha256').update(password).digest('hex')
}

export function verifyPassword( password: string, hash: string ): boolean {
    return hashPassword(password) === hash
}

export function lockColor(
    roomId: string,
    color: string,
    userId: string,
    password: string,
): { success: boolean; message: string; previousLock?: string; tookOver?: boolean } {
    const state = getRoomColorLocks(roomId)

    let tookOver = false
    if (state.locks.has(color)) {
        const existingLock = state.locks.get(color)!
        if (existingLock.userId !== userId) {
            if (!verifyPassword(password, existingLock.passwordHash)) {
                return {success: false, message: 'Incorrect password for taking over this color lock.'}
            }
            tookOver = true
        }
    }

    let previousLock: string | undefined
    for (const [lockedColor, lock] of Array.from(state.locks.entries())) {
        if (lock.userId === userId && lockedColor !== color) {
            previousLock = lockedColor
            state.locks.delete(lockedColor)
            break
        }
    }

    const passwordHash = hashPassword(password)
    state.locks.set(color, {
        color,
        userId,
        passwordHash,
        timestamp: Date.now(),
    })

    let message = `Successfully locked ${color}`
    if (tookOver) {
        message = `Successfully took over ${color} lock`
    } else if (previousLock) {
        message = `Successfully locked ${color}. Previous lock on ${previousLock} was removed.`
    }

    return {
        success: true,
        message,
        previousLock,
        tookOver,
    }
}

export function unlockColor(
    roomId: string,
    color: string,
    userId: string,
    password: string,
): { success: boolean; message: string } {
    const state = getRoomColorLocks(roomId)

    const lock = state.locks.get(color)
    if (!lock) {
        return {success: false, message: 'Color is not locked'}
    }

    if (lock.userId !== userId) {
        return {success: false, message: 'You do not own this color lock'}
    }

    if (!verifyPassword(password, lock.passwordHash)) {
        return {success: false, message: 'Invalid password'}
    }

    state.locks.delete(color)
    return {success: true, message: `Successfully unlocked ${color}`}
}

export function isColorLocked( roomId: string, color: string ): boolean {
    const state = getRoomColorLocks(roomId)
    return state.locks.has(color)
}

export function getColorLockOwner( roomId: string, color: string ): string | undefined {
    const state = getRoomColorLocks(roomId)
    return state.locks.get(color)?.userId
}

export function getUserLockedColor( roomId: string, userId: string ): string | undefined {
    const state = getRoomColorLocks(roomId)
    for (const [color, lock] of Array.from(state.locks.entries())) {
        if (lock.userId === userId) {
            return color
        }
    }
    return undefined
}

export function getAllLockedColors( roomId: string ): { color: string; userId: string }[] {
    const state = getRoomColorLocks(roomId)
    return Array.from(state.locks.entries()).map(( [color, lock] ) => ({
        color,
        userId: lock.userId,
    }))
}

export function canUserUseColor( roomId: string, color: string, userId: string ): boolean {
    const lockOwner = getColorLockOwner(roomId, color)
    return !lockOwner || lockOwner === userId
}

export function clearRoomColorLocks( roomId: string ): void {
    roomColorLocks.delete(roomId)
}

export function serializeColorLocks( roomId: string ): string {
    const state = getRoomColorLocks(roomId)
    const locks = Array.from(state.locks.entries()).map(( [color, lock] ) => [color, lock])
    return JSON.stringify(locks)
}

export function deserializeColorLocks( roomId: string, data: string ): void {
    try {
        const locks = JSON.parse(data) as [string, ColorLock][]
        const state = getRoomColorLocks(roomId)
        state.locks = new Map(locks)
    } catch (error) {
        console.error('Error deserializing color locks:', error)
    }
}
