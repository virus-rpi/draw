import { useCallback, useEffect, useRef, useState } from 'react'

export interface LockedColor {
    color: string
    userId: string
}

export interface ColorLockResult {
    success: boolean
    message: string
    previousLock?: string
}

const getSyncServerUrl = () => {
    if (process.env.NEXT_PUBLIC_SYNC_SERVER_URL) {
        return process.env.NEXT_PUBLIC_SYNC_SERVER_URL
    }
    return 'http://localhost:5858'
}

const getWsServerUrl = () => {
    const baseUrl = getSyncServerUrl()
    return baseUrl.replace(/^http/, 'ws')
}

export function useColorLock( roomId: string, userId: string ) {
    const [lockedColors, setLockedColors] = useState<LockedColor[]>([])
    const [myLockedColor, setMyLockedColor] = useState<string | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    const fetchLockedColors = useCallback(async () => {
        if (!roomId) return

        try {
            const response = await fetch(`${getSyncServerUrl()}/color-locks/${encodeURIComponent(roomId)}`)
            const data = await response.json()
            setLockedColors(data.locks || [])

            const myLock = data.locks?.find(( lock: LockedColor ) => lock.userId === userId)
            setMyLockedColor(myLock?.color || null)
        } catch (error) {
            console.error('Failed to fetch locked colors:', error)
        }
    }, [roomId, userId])

    useEffect(() => {
        if (!roomId || !userId) return

        fetchLockedColors().then()

        const wsUrl = `${getWsServerUrl()}/color-locks-ws/${encodeURIComponent(roomId)}`
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
            console.log('Color lock WebSocket connected')
        }

        ws.onmessage = ( event ) => {
            try {
                const data = JSON.parse(event.data)
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
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error)
            }
        }

        ws.onerror = ( error ) => {
            console.error('WebSocket error:', error)
        }

        ws.onclose = () => {
            console.log('Color lock WebSocket disconnected')
        }

        wsRef.current = ws

        return () => {
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
        }
    }, [roomId, userId])

    const lockColor = useCallback(async ( color: string, password: string ): Promise<ColorLockResult> => {
        try {
            const response = await fetch(`${getSyncServerUrl()}/color-lock/${encodeURIComponent(roomId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({color, userId, password}),
            })

            const result = await response.json()

            if (result.success) {
                await fetchLockedColors()
            }

            return result
        } catch (error) {
            console.error('Failed to lock color:', error)
            return {success: false, message: 'Network error'}
        }
    }, [roomId, userId, fetchLockedColors])

    const unlockColor = useCallback(async ( color: string, password: string ): Promise<ColorLockResult> => {
        try {
            const response = await fetch(`${getSyncServerUrl()}/color-unlock/${encodeURIComponent(roomId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({color, userId, password}),
            })

            const result = await response.json()

            if (result.success) {
                await fetchLockedColors()
            }

            return result
        } catch (error) {
            console.error('Failed to unlock color:', error)
            return {success: false, message: 'Network error'}
        }
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
