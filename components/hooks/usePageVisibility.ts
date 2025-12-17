import { useEffect, useRef, useState } from 'react'
import { Editor } from 'tldraw'

interface PageVisibilityOptions {
    editor: Editor | null
    onDrawWhileAway?: () => void
}

export function usePageVisibility({
    editor,
    onDrawWhileAway,
}: PageVisibilityOptions) {
    const [isVisible, setIsVisible] = useState(true)
    const shapesAddedWhileAwayRef = useRef<boolean>(false)
    const hasNotifiedRef = useRef<boolean>(false)

    useEffect(() => {
        if (!editor) return

        // Listen for shape changes while user is away
        const handleChange = () => {
            // Only track if page is not visible and we haven't notified yet
            if (document.hidden && !hasNotifiedRef.current) {
                shapesAddedWhileAwayRef.current = true
            }
        }

        // Listen to history changes (shape additions, modifications, deletions)
        const unsubscribe = editor.store.listen(handleChange, { 
            scope: 'document',
            source: 'user'
        })

        return () => {
            unsubscribe()
        }
    }, [editor])

    useEffect(() => {
        if (!editor) return

        const handleVisibilityChange = () => {
            const visible = !document.hidden
            setIsVisible(visible)

            if (!visible) {
                // User left the page - reset tracking
                shapesAddedWhileAwayRef.current = false
                hasNotifiedRef.current = false
            } else {
                // User returned to the page - check if shapes were added
                if (!hasNotifiedRef.current && shapesAddedWhileAwayRef.current) {
                    onDrawWhileAway?.()
                    hasNotifiedRef.current = true
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [editor, onDrawWhileAway])

    return { isVisible }
}
