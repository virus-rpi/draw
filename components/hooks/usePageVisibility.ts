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
    const shapeCountRef = useRef<number>(0)
    const hasNotifiedRef = useRef<boolean>(false)

    useEffect(() => {
        if (!editor) return

        // Initialize shape count
        shapeCountRef.current = editor.getCurrentPageShapes().length
    }, [editor])

    useEffect(() => {
        if (!editor) return

        const handleVisibilityChange = () => {
            const visible = !document.hidden
            setIsVisible(visible)

            if (!visible) {
                // User left the page - record current shape count
                shapeCountRef.current = editor.getCurrentPageShapes().length
                hasNotifiedRef.current = false
            } else {
                // User returned to the page - check if shapes were added
                if (!hasNotifiedRef.current) {
                    const currentShapeCount = editor.getCurrentPageShapes().length
                    if (currentShapeCount > shapeCountRef.current) {
                        onDrawWhileAway?.()
                        hasNotifiedRef.current = true
                    }
                    shapeCountRef.current = currentShapeCount
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [editor, onDrawWhileAway])

    return { isVisible }
}
