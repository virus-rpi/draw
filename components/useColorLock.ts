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

const getSyncServerUrl = () => {
    if (process.env.NEXT_PUBLIC_SYNC_SERVER_URL) {
        return process.env.NEXT_PUBLIC_SYNC_SERVER_URL
    }
    return 'http://localhost:5858'
}

export function useColorLock(roomId: string, userId: string) {
    const [lockedColors, setLockedColors] = useState<LockedColor[]>([])
    const [myLockedColor, setMyLockedColor] = useState<string | null>(null)

    const fetchLockedColors = useCallback(async () => {
        if (!roomId) return
        
        try {
            const response = await fetch(`${getSyncServerUrl()}/color-locks/${roomId}`)
            const data = await response.json()
            setLockedColors(data.locks || [])
            
            // Update my locked color
            const myLock = data.locks?.find((lock: LockedColor) => lock.userId === userId)
            setMyLockedColor(myLock?.color || null)
        } catch (error) {
            console.error('Failed to fetch locked colors:', error)
        }
    }, [roomId, userId])

    useEffect(() => {
        fetchLockedColors()
        
        // Poll for updates every 2 seconds
        const interval = setInterval(fetchLockedColors, 2000)
        
        return () => clearInterval(interval)
    }, [fetchLockedColors])

    const lockColor = useCallback(async (color: string, password: string): Promise<ColorLockResult> => {
        try {
            const response = await fetch(`${getSyncServerUrl()}/color-lock/${roomId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ color, userId, password }),
            })
            
            const result = await response.json()
            
            if (result.success) {
                await fetchLockedColors()
            }
            
            return result
        } catch (error) {
            console.error('Failed to lock color:', error)
            return { success: false, message: 'Network error' }
        }
    }, [roomId, userId, fetchLockedColors])

    const unlockColor = useCallback(async (color: string, password: string): Promise<ColorLockResult> => {
        try {
            const response = await fetch(`${getSyncServerUrl()}/color-unlock/${roomId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ color, userId, password }),
            })
            
            const result = await response.json()
            
            if (result.success) {
                await fetchLockedColors()
            }
            
            return result
        } catch (error) {
            console.error('Failed to unlock color:', error)
            return { success: false, message: 'Network error' }
        }
    }, [roomId, userId, fetchLockedColors])

    const isColorLocked = useCallback((color: string): boolean => {
        return lockedColors.some(lock => lock.color === color)
    }, [lockedColors])

    const canUseColor = useCallback((color: string): boolean => {
        const lock = lockedColors.find(lock => lock.color === color)
        return !lock || lock.userId === userId
    }, [lockedColors, userId])

    const getColorOwner = useCallback((color: string): string | undefined => {
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
