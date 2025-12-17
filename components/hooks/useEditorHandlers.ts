import { useEffect, useRef } from 'react'
import { Editor } from 'tldraw'

interface EditorHandlersOptions {
    writeOwnOnly: boolean
    canUseColor: ( color: string ) => boolean
    lockedColors: Array<{ color: string; userId: string }>
    userId: string
}

export function useEditorHandlers( {
                                        writeOwnOnly,
                                        canUseColor,
                                        lockedColors,
                                        userId,
                                    }: EditorHandlersOptions ) {
    const writeOwnOnlyRef = useRef<boolean>(writeOwnOnly)
    const canUseColorRef = useRef(canUseColor)
    const lockedColorsRef = useRef(lockedColors)
    const userIdRef = useRef(userId)

    // Keep refs updated
    useEffect(() => {
        writeOwnOnlyRef.current = writeOwnOnly
    }, [writeOwnOnly])

    useEffect(() => {
        canUseColorRef.current = canUseColor
        lockedColorsRef.current = lockedColors
        userIdRef.current = userId
    }, [canUseColor, lockedColors, userId])

    const setupEditorHandlers = ( editor: Editor ) => {
        let lastToastMessage = ''
        let lastToastTime = 0
        const TOAST_DEBOUNCE_MS = 1000

        const showToast = ( title: string, severity: 'info' | 'success' | 'error' ) => {
            const now = Date.now()
            if (title === lastToastMessage && (now - lastToastTime) < TOAST_DEBOUNCE_MS) {
                return
            }
            lastToastMessage = title
            lastToastTime = now

            const event = new CustomEvent('show-toast', {
                detail: {title, severity},
            })
            window.dispatchEvent(event)
        }

        // Set initial meta for shapes
        editor.getInitialMetaForShape = ( _shape ) => {
            return {
                ownerId: editor.user.getId(),
            }
        }

        // Handle shape changes
        editor.sideEffects.registerBeforeChangeHandler('shape', ( prev, next, source ) => {
            if (source !== 'user') return next
            const currentUserId = editor.user.getId()
            
            if (writeOwnOnlyRef.current && prev.meta.ownerId !== currentUserId) {
                console.log('Shape owned by another user, preventing modification')
                return prev
            }
            
            const prevColor = (prev as any).props?.color
            const nextColor = (next as any).props?.color

            if (nextColor && nextColor !== prevColor && !canUseColorRef.current(nextColor)) {
                console.log('Attempted color change to locked color, prevented')
                showToast(
                    `The color "${nextColor}" is locked. Use Lock/Unlock Color to take it over with the password.`,
                    'info',
                )
                return prev
            }

            if (prevColor && !canUseColorRef.current(prevColor)) {
                console.log('Shape has locked color user does not own, preventing modification')
                showToast(
                    `This shape is using the locked color "${prevColor}". You cannot modify it unless you lock it with the password.`,
                    'info',
                )
                return prev
            }
            
            return next
        })

        // Handle selection changes
        editor.sideEffects.registerBeforeChangeHandler('instance_page_state', ( _prev, next ) => {
            if (!writeOwnOnlyRef.current || next.selectedShapeIds.length === 0) return next
            next.selectedShapeIds = next.selectedShapeIds.filter(( id ) => {
                const shape = editor.getShape(id)
                if (!shape) return false
                return !(shape.meta.ownerId !== editor.user.getId() && writeOwnOnlyRef.current)
            })
            return next
        })

        // Handle color style changes
        editor.sideEffects.registerBeforeChangeHandler('instance', ( prev, next ) => {
            const prevStyles = (prev as any).stylesForNextShape
            const nextStyles = (next as any).stylesForNextShape

            if (nextStyles && nextStyles['tldraw:color'] && prevStyles['tldraw:color'] !== nextStyles['tldraw:color']) {
                const newColor = nextStyles['tldraw:color']
                if (!canUseColorRef.current(newColor)) {
                    console.log('Locked color selected in UI, reverting')
                    showToast(
                        `The color "${newColor}" is locked. Use Lock/Unlock Color to take it over with the password.`,
                        'info',
                    )
                    return prev
                }
            }
            return next
        })

        // Handle shape deletion
        editor.sideEffects.registerBeforeDeleteHandler('shape', ( shape, source ) => {
            if (source !== 'user') return
            const currentUserId = editor.user.getId()
            
            if (writeOwnOnlyRef.current && shape.meta.ownerId !== currentUserId) {
                console.log('Shape owned by another user, preventing deletion')
                return false
            }
            
            if ((shape as any).props?.color && !canUseColorRef.current((shape as any).props.color)) {
                console.log('Shape has locked color user does not own, preventing deletion')
                showToast(
                    `This shape is using the locked color "${(shape as any).props.color}". You cannot delete it unless you lock it with the password.`,
                    'info',
                )
                return false
            }
            
            return
        })
    }

    return { setupEditorHandlers }
}
