'use client'

import { useEffect, useState } from 'react'
import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'

function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function ( c ) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

export default function TldrawEditor() {
    const [roomId, setRoomId] = useState<string>('')

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

    useEffect(() => {
        if (!roomId) return
        const removeWatermark = () => {
            const elementToRemove = document.querySelector('.tl-watermark_SEE-LICENSE')
            if (elementToRemove) {
                elementToRemove.remove()
            }
        }
        removeWatermark()
        const observer = new MutationObserver(() => {
            removeWatermark()
        })
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })
        return () => {
            observer.disconnect()
        }
    }, [roomId])


    const store = useSyncDemo({roomId})

    if (!roomId) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
        <div style={{position: 'fixed', inset: 0}}>
            <Tldraw
                store={store}
                deepLinks
            />
        </div>
    )
}
