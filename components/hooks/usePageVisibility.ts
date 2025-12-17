import { useEffect, useRef, useState } from 'react'
import { Editor } from 'tldraw'

interface PageVisibilityOptions {
    editor: Editor | null
    enabled: boolean
    onDrawWhileAway?: () => void
    onDrawWhileAwayBrowser?: () => void
}

export function usePageVisibility({
    editor,
    enabled,
    onDrawWhileAway,
    onDrawWhileAwayBrowser,
}: PageVisibilityOptions) {
    const [isVisible, setIsVisible] = useState(true)
    const shapeCountRef = useRef<number>(0)
    const hasNotifiedRef = useRef<boolean>(false)
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!editor) return

        // Initialize shape count
        shapeCountRef.current = editor.getCurrentPageShapes().length
    }, [editor])

    useEffect(() => {
        if (!enabled) return

        const handleVisibilityChange = () => {
            const visible = !document.hidden
            setIsVisible(visible)

            if (!visible) {
                // User left the page - record current shape count
                if (editor) {
                    shapeCountRef.current = editor.getCurrentPageShapes().length
                    hasNotifiedRef.current = false
                    
                    // Start checking for changes while user is away
                    if (checkIntervalRef.current) {
                        clearInterval(checkIntervalRef.current)
                    }
                    
                    checkIntervalRef.current = setInterval(() => {
                        if (editor && !hasNotifiedRef.current) {
                            const currentShapeCount = editor.getCurrentPageShapes().length
                            if (currentShapeCount > shapeCountRef.current) {
                                // Send browser notification while user is away
                                onDrawWhileAwayBrowser?.()
                                hasNotifiedRef.current = true
                                if (checkIntervalRef.current) {
                                    clearInterval(checkIntervalRef.current)
                                    checkIntervalRef.current = null
                                }
                            }
                        }
                    }, 2000) // Check every 2 seconds
                }
            } else {
                // User returned to the page - clear interval and check if shapes were added
                if (checkIntervalRef.current) {
                    clearInterval(checkIntervalRef.current)
                    checkIntervalRef.current = null
                }
                
                if (editor && !hasNotifiedRef.current) {
                    const currentShapeCount = editor.getCurrentPageShapes().length
                    if (currentShapeCount > shapeCountRef.current) {
                        // Send toast notification when user returns
                        onDrawWhileAway?.()
                        hasNotifiedRef.current = true
                    }
                    shapeCountRef.current = currentShapeCount
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current)
            }
        }
    }, [editor, enabled, onDrawWhileAway, onDrawWhileAwayBrowser])

    return { isVisible }
}
