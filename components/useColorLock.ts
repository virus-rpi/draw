import { useCallback, useEffect, useState } from 'react'

export interface LockedColor {
    color: string
    userId: string
}

export interface ColorLockResult {
    success: boolean
    message: string
    previousLock?: string
}

export interface ColorLockCustomMessageHandler {
    ( data: any ): void
}

const getSyncServerUrl = () => {
    if (process.env.NEXT_PUBLIC_SYNC_SERVER_URL) {
        return process.env.NEXT_PUBLIC_SYNC_SERVER_URL
    }
    return 'http://localhost:5858'
}

export function useColorLock( roomId: string, userId: string, customMessageHandler?: ColorLockCustomMessageHandler ) {
    const [lockedColors, setLockedColors] = useState<LockedColor[]>([])
    const [myLockedColor, setMyLockedColor] = useState<string | null>(null)

    const fetchLockedColors = useCallback(async () => {
        if (!roomId) return

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

            const response = await fetch(`${getSyncServerUrl()}/color-locks/${encodeURIComponent(roomId)}`, {
                signal: controller.signal,
            })
            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setLockedColors(data.locks || [])

            const myLock = data.locks?.find(( lock: LockedColor ) => lock.userId === userId)
            setMyLockedColor(myLock?.color || null)
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.error('Fetch locked colors timed out')
            } else {
                console.error('Failed to fetch locked colors:', error)
            }
        }
    }, [roomId, userId])

    const handleCustomMessage = useCallback(( data: any ) => {
        if (data.type === 'color-lock-update') {
            const newLocks: LockedColor[] = data.locks || []
            const serialized = JSON.stringify(newLocks)

            setLockedColors(prev => {
                if (JSON.stringify(prev) === serialized) return prev
                return newLocks
            })

            const myLock = newLocks.find(( lock: LockedColor ) => lock.userId === userId)
            setMyLockedColor(prev => {
                const newColor = myLock?.color || null
                return prev === newColor ? prev : newColor
            })
        }
    }, [userId])

    useEffect(() => {
        if (customMessageHandler) {
            customMessageHandler(handleCustomMessage)
        }
    }, [customMessageHandler, handleCustomMessage])

    useEffect(() => {
        if (!roomId || !userId) return
        fetchLockedColors()
    }, [roomId, userId, fetchLockedColors])

    const lockColor = useCallback(async ( color: string, password: string ): Promise<ColorLockResult> => {
        const maxRetries = 3
        let lastError: Error | null = null

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

                const response = await fetch(`${getSyncServerUrl()}/color-lock/${encodeURIComponent(roomId)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({color, userId, password}),
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json()

                if (result.success) {
                    await fetchLockedColors()
                }

                return result
            } catch (error) {
                lastError = error as Error
                console.error(`Failed to lock color (attempt ${attempt + 1}/${maxRetries}):`, error)

                if (lastError.name === 'AbortError' || attempt === maxRetries - 1) {
                    break
                }

                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
            }
        }

        if (lastError?.name === 'AbortError') {
            return {success: false, message: 'Request timed out. Please check your connection and try again.'}
        }
        return {success: false, message: 'Network error. Please check your connection and try again.'}
    }, [roomId, userId, fetchLockedColors])

    const unlockColor = useCallback(async ( color: string, password: string ): Promise<ColorLockResult> => {
        const maxRetries = 3
        let lastError: Error | null = null

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

                const response = await fetch(`${getSyncServerUrl()}/color-unlock/${encodeURIComponent(roomId)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({color, userId, password}),
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json()

                if (result.success) {
                    await fetchLockedColors()
                }

                return result
            } catch (error) {
                lastError = error as Error
                console.error(`Failed to unlock color (attempt ${attempt + 1}/${maxRetries}):`, error)

                if (lastError.name === 'AbortError' || attempt === maxRetries - 1) {
                    break
                }

                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
            }
        }

        if (lastError?.name === 'AbortError') {
            return {success: false, message: 'Request timed out. Please check your connection and try again.'}
        }
        return {success: false, message: 'Network error. Please check your connection and try again.'}
    }, [roomId, userId, fetchLockedColors])

    const isColorLocked = useCallback(( color: string ): boolean => {
        return lockedColors.some(lock => lock.color === color)
    }, [lockedColors])

    const canUseColor = useCallback(( color: string ): boolean => {
        const lock = lockedColors.find(lock => lock.color === color)
        return !lock || lock.userId === userId
    }, [lockedColors, userId])

    const getColorOwner = useCallback(( color: string ): string | undefined => {
        return lockedColors.find(lock => lock.color === color)?.userId
    }, [lockedColors])

    return {
        lockedColors,
        myLockedColor,
        lockColor,
        unlockColor,
        isColorLocked,
        canUseColor,
        getColorOwner,
        refresh: fetchLockedColors,
    }
}
