import { useEffect, useState } from 'react'
import { generateUUID } from '../utils/uuid'

export function useRoomSetup() {
    const [roomId, setRoomId] = useState<string>('')
    const [userId, setUserId] = useState<string>('')

    // Initialize user ID from localStorage or generate new one
    useEffect(() => {
        let storedUserId = localStorage.getItem('draw-user-id')
        if (!storedUserId) {
            storedUserId = generateUUID()
            localStorage.setItem('draw-user-id', storedUserId)
        }
        setUserId(storedUserId)
    }, [])

    // Initialize room ID from URL params or generate new one
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        let room = params.get('room')

        if (!room) {
            room = generateUUID()
            const newUrl = `${window.location.pathname}?room=${room}`
            window.history.replaceState({}, '', newUrl)
        }

        setRoomId(room)
    }, [])

    return { roomId, userId }
}
