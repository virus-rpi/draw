'use client'

import { useEffect, useRef, useState } from 'react'
import {
    AssetRecordType,
    DefaultQuickActions,
    DefaultQuickActionsContent,
    getHashForString,
    TLAssetStore,
    TLBookmarkAsset,
    TLComponents,
    Tldraw,
    TldrawUiMenuItem,
    uniqueId,
    Editor,
    DefaultStylePanel,
    DefaultStylePanelContent,
    useEditor,
    useValue,
} from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { useColorLock } from './useColorLock'
import { ColorLockDialog } from './ColorLockDialog'
import { CustomColorPicker } from './CustomColorPicker'

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


function CustomQuickActions( {
    writeOwnOnly, 
    onToggle,
    onColorLock,
    onCustomColor
}: { 
    writeOwnOnly: boolean
    onToggle: () => void
    onColorLock: () => void
    onCustomColor: () => void
} ) {
    return (
        <DefaultQuickActions>
            <DefaultQuickActionsContent/>
            <TldrawUiMenuItem
                id="toggle-edit-own-only"
                icon={writeOwnOnly ? 'lock' : 'unlock'}
                onSelect={onToggle}
            />
            <TldrawUiMenuItem
                id="color-lock"
                icon="color"
                onSelect={onColorLock}
                label="Lock/Unlock Color"
            />
            <TldrawUiMenuItem
                id="custom-color"
                icon="color"
                onSelect={onCustomColor}
                label="Custom Color"
            />
        </DefaultQuickActions>
    )
}

function CustomStylePanel({ 
    myLockedColor, 
    canUseColor, 
    isColorLocked 
}: { 
    myLockedColor: string | null
    canUseColor: (color: string) => boolean
    isColorLocked: (color: string) => boolean
}) {
    const editor = useEditor()
    const currentColor = useValue('current color', () => {
        const selectedShapes = editor.getSelectedShapes()
        if (selectedShapes.length === 0) return null
        const firstShape = selectedShapes[0] as any
        return firstShape?.props?.color || null
    }, [editor])

    return (
        <DefaultStylePanel>
            <DefaultStylePanelContent />
            {myLockedColor && (
                <div style={{
                    padding: '8px',
                    fontSize: '12px',
                    color: '#666',
                    borderTop: '1px solid #eee',
                }}>
                    🔒 Locked: {myLockedColor}
                </div>
            )}
        </DefaultStylePanel>
    )
}

export default function TldrawEditor() {
    const [roomId, setRoomId] = useState<string>('')
    const [userId, setUserId] = useState<string>('')
    const [writeOwnOnly, setWriteOwnOnly] = useState<boolean>(true)
    const writeOwnOnlyRef = useRef<boolean>(writeOwnOnly)
    const [showColorLockDialog, setShowColorLockDialog] = useState(false)
    const [colorLockMode, setColorLockMode] = useState<'lock' | 'unlock'>('lock')
    const [selectedColorForLock, setSelectedColorForLock] = useState<string>('')
    const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)
    const editorRef = useRef<Editor | null>(null)

    const colorLock = useColorLock(roomId, userId)
    const { myLockedColor, lockColor, unlockColor, canUseColor, isColorLocked } = colorLock

    useEffect(() => {
        writeOwnOnlyRef.current = writeOwnOnly
    }, [writeOwnOnly])

    useEffect(() => {
        // Generate or retrieve user ID
        let storedUserId = localStorage.getItem('draw-user-id')
        if (!storedUserId) {
            storedUserId = generateUUID()
            localStorage.setItem('draw-user-id', storedUserId)
        }
        setUserId(storedUserId)
    }, [])

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


    const getSyncUrl = () => {
        if (process.env.NEXT_PUBLIC_SYNC_SERVER_URL) {
            return `${process.env.NEXT_PUBLIC_SYNC_SERVER_URL}/connect/${roomId}`
        }
        return `ws://localhost:5858/connect/${roomId}`
    }

    const handleColorLockClick = () => {
        const editor = editorRef.current
        if (!editor) return

        // Get the current color from selected shapes or editor state
        const selectedShapes = editor.getSelectedShapes()
        let currentColor = 'black' // default

        if (selectedShapes.length > 0) {
            const firstShape = selectedShapes[0] as any
            if (firstShape?.props?.color) {
                currentColor = firstShape.props.color
            }
        }

        setSelectedColorForLock(currentColor)
        
        // Check if this color is already locked by this user
        if (myLockedColor === currentColor) {
            setColorLockMode('unlock')
        } else {
            setColorLockMode('lock')
        }
        
        setShowColorLockDialog(true)
    }

    const handleColorLockConfirm = async (password: string) => {
        let result
        if (colorLockMode === 'lock') {
            result = await lockColor(selectedColorForLock, password)
        } else {
            result = await unlockColor(selectedColorForLock, password)
        }
        
        if (result.success) {
            alert(result.message)
            setShowColorLockDialog(false)
        } else {
            alert(`Error: ${result.message}`)
        }
    }

    const handleCustomColorSelect = (color: string) => {
        const editor = editorRef.current
        if (!editor) return

        // Check if the custom color is locked
        if (!canUseColor(color)) {
            alert('This color is locked by another user')
            return
        }

        // Set the color on selected shapes
        const selectedShapes = editor.getSelectedShapes()
        if (selectedShapes.length > 0) {
            editor.updateShapes(
                selectedShapes.map((shape) => ({
                    id: shape.id,
                    type: shape.type,
                    props: {
                        ...(shape as any).props,
                        color: color,
                    },
                }))
            )
        }
    }

    const store = useSync({
        uri: getSyncUrl(),
        assets: multiplayerAssets,
        userInfo: userId ? {
            id: userId,
            name: `User ${userId.slice(0, 8)}`,
            color: myLockedColor || '#000000',
        } : undefined,
    })

    if (!roomId) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    const components: TLComponents = {
        QuickActions: () => (
            <CustomQuickActions
                writeOwnOnly={writeOwnOnly}
                onToggle={() => setWriteOwnOnly(!writeOwnOnly)}
                onColorLock={handleColorLockClick}
                onCustomColor={() => setShowCustomColorPicker(true)}
            />
        ),
        StylePanel: () => (
            <CustomStylePanel
                myLockedColor={myLockedColor}
                canUseColor={canUseColor}
                isColorLocked={isColorLocked}
            />
        ),
    }

    return (
        <>
            <div style={{
                position: 'fixed',
                inset: 0,
                touchAction: 'none',
                overflow: 'hidden',
                WebkitOverflowScrolling: 'auto',
            }}>
                <Tldraw
                    store={store}
                    deepLinks
                    components={components}
                    onMount={( editor ) => {
                        editorRef.current = editor
                        editor.registerExternalAssetHandler('url', unfurlBookmarkUrl)
                        editor.setCurrentTool('draw')

                        editor.store.sideEffects.registerBeforeCreateHandler('shape', ( shape ) => {
                            console.log('shape created', shape)
                            console.log('current user id', editor.user.getId())
                            console.log('writeOwnOnly', writeOwnOnlyRef.current)
                            
                            const shapeColor = (shape as any).props?.color
                            
                            // Check if the color is locked and user doesn't own it
                            // If so, change the color to black (default)
                            let newShape = { ...shape }
                            if (shapeColor && !canUseColor(shapeColor)) {
                                console.log('Color is locked, changing to default color')
                                newShape = {
                                    ...shape,
                                    props: {
                                        ...(shape as any).props,
                                        color: 'black',
                                    },
                                } as typeof shape
                            }
                            
                            return {
                                ...newShape,
                                meta: {
                                    ...newShape.meta,
                                    ownerId: editor.user.getId(),
                                },
                            }
                        })

                        editor.sideEffects.registerBeforeChangeHandler('shape', ( prev, next ) => {
                            // Check writeOwnOnly mode
                            if (writeOwnOnlyRef.current && prev.meta.ownerId !== editor.user.getId()) {
                                return prev
                            }
                            
                            // Check color lock
                            const prevColor = (prev as any).props?.color
                            const nextColor = (next as any).props?.color
                            
                            // If color is changing to a locked color, prevent it
                            if (nextColor && nextColor !== prevColor && !canUseColor(nextColor)) {
                                console.log('Color is locked, preventing color change')
                                return prev
                            }
                            
                            // If shape has a locked color and user doesn't own it, prevent changes
                            if (prevColor && !canUseColor(prevColor)) {
                                console.log('Shape has locked color, preventing modification')
                                return prev
                            }
                            
                            return next
                        })

                        editor.sideEffects.registerBeforeChangeHandler('instance_page_state', ( prev, next ) => {
                            if (!writeOwnOnlyRef.current || next.selectedShapeIds.length === 0) return next
                            const shapes = editor.getCurrentPageShapes()
                            next.selectedShapeIds = next.selectedShapeIds.filter(( id ) => {
                                const shape = shapes.find(( s ) => s.id === id)
                                if (!shape) return false
                                return !(shape.meta.ownerId !== editor.user.getId() && writeOwnOnlyRef.current)
                            })
                            return next
                        })

                        editor.sideEffects.registerBeforeDeleteHandler('shape', ( shape ) => {
                            if (writeOwnOnlyRef.current && shape.meta.ownerId !== editor.user.getId()) {
                                return false
                            }
                            
                            // Check if shape has a locked color
                            const shapeColor = (shape as any).props?.color
                            if (shapeColor && !canUseColor(shapeColor)) {
                                console.log('Shape has locked color, preventing deletion')
                                return false
                            }
                            
                            return
                        })

                    }}
                />
            </div>
            {showColorLockDialog && (
                <ColorLockDialog
                    color={selectedColorForLock}
                    isLocking={colorLockMode === 'lock'}
                    onConfirm={handleColorLockConfirm}
                    onCancel={() => setShowColorLockDialog(false)}
                />
            )}
            {showCustomColorPicker && (
                <CustomColorPicker
                    onColorSelect={handleCustomColorSelect}
                    onClose={() => setShowCustomColorPicker(false)}
                />
            )}
        </>
    )
}

const multiplayerAssets: TLAssetStore = {
    async upload( _asset, file ) {
        const id = uniqueId()
        const objectName = `${id}-${file.name}`
        const url = `/api/uploads/${encodeURIComponent(objectName)}`

        const response = await fetch(url, {
            method: 'PUT',
            body: file,
        })

        if (!response.ok) {
            throw new Error(`Failed to upload asset: ${response.statusText}`)
        }

        const data = await response.json()
        return {src: data.url || url}
    },
    resolve( asset ) {
        return asset.props.src
    },
}

async function unfurlBookmarkUrl( {url}: { url: string } ): Promise<TLBookmarkAsset> {
    const asset: TLBookmarkAsset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: 'asset',
        type: 'bookmark',
        meta: {},
        props: {
            src: url,
            description: '',
            image: '',
            favicon: '',
            title: '',
        },
    }

    try {
        const response = await fetch(`/api/unfurl?url=${encodeURIComponent(url)}`)
        const data = await response.json()

        asset.props.description = data?.description ?? ''
        asset.props.image = data?.image ?? ''
        asset.props.favicon = data?.favicon ?? ''
        asset.props.title = data?.title ?? ''
    } catch (e) {
        console.error(e)
    }

    return asset
}
