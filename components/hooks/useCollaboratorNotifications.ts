import { useEffect, useRef } from 'react'
import { Editor, TLInstancePresence } from 'tldraw'

interface CollaboratorNotificationsOptions {
    editor: Editor | null
    enabled: boolean
    onJoin?: (presence: TLInstancePresence) => void
    onLeave?: (presence: TLInstancePresence) => void
}

export function useCollaboratorNotifications({
    editor,
    enabled,
    onJoin,
    onLeave,
}: CollaboratorNotificationsOptions) {
    const prevCollaboratorsRef = useRef<Map<string, TLInstancePresence>>(new Map())

    useEffect(() => {
        if (!editor || !enabled) return

        // Check for changes in collaborators periodically
        const checkInterval = setInterval(() => {
            const currentCollaborators = editor.getCollaborators()
            const currentMap = new Map<string, TLInstancePresence>()
            
            currentCollaborators.forEach(presence => {
                currentMap.set(presence.userId, presence)
            })

            const prevMap = prevCollaboratorsRef.current

            // Check for new collaborators (joined)
            currentMap.forEach((presence, userId) => {
                if (!prevMap.has(userId)) {
                    onJoin?.(presence)
                }
            })

            // Check for removed collaborators (left)
            prevMap.forEach((presence, userId) => {
                if (!currentMap.has(userId)) {
                    onLeave?.(presence)
                }
            })

            prevCollaboratorsRef.current = currentMap
        }, 1000) // Check every second

        return () => clearInterval(checkInterval)
    }, [editor, enabled, onJoin, onLeave])
}
