import { useEffect, useRef } from 'react'
import { Editor, TLInstancePresence } from 'tldraw'

interface CollaboratorNotificationsOptions {
    editor: Editor | null
    onJoin?: (presence: TLInstancePresence) => void
    onLeave?: (presence: TLInstancePresence) => void
}

export function useCollaboratorNotifications({
    editor,
    onJoin,
    onLeave,
}: CollaboratorNotificationsOptions) {
    const prevCollaboratorsRef = useRef<Map<string, TLInstancePresence>>(new Map())

    useEffect(() => {
        if (!editor) return

        // Use store listener for presence changes instead of polling
        const checkCollaborators = () => {
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
        }

        // Listen to presence changes via the store
        const unsubscribe = editor.store.listen(() => {
            // Only check when presence records change
            checkCollaborators()
        }, {
            scope: 'presence',
            source: 'remote'
        })

        // Initial check
        checkCollaborators()

        return () => {
            unsubscribe()
        }
    }, [editor, onJoin, onLeave])
}
