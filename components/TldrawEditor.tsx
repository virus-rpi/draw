'use client'

import { useEffect, useRef, useState } from 'react'
import {
    AssetRecordType,
    DefaultColorThemePalette,
    DefaultQuickActions,
    DefaultQuickActionsContent,
    DefaultStylePanel,
    DefaultStylePanelContent,
    Editor,
    getHashForString,
    TLAssetStore,
    TLBookmarkAsset,
    Tldraw,
    TldrawUiMenuItem,
    uniqueId,
    useToasts,
} from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { useColorLock } from './useColorLock'
import { ColorLockDialog } from './ColorLockDialog'

DefaultColorThemePalette.lightMode.red.solid = '#ec2d44'
DefaultColorThemePalette.darkMode.red.solid = '#ec2d44'

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
                             }: {
    writeOwnOnly: boolean
    onToggle: () => void
    onColorLock: () => void
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
        </DefaultQuickActions>
    )
}

function CustomStylePanel() {
    return (
        <DefaultStylePanel>
            <DefaultStylePanelContent/>
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
    const editorRef = useRef<Editor | null>(null)

    const colorLock = useColorLock(roomId, userId)
    const {myLockedColor, lockColor, unlockColor, canUseColor, lockedColors} = colorLock

    const canUseColorRef = useRef(canUseColor)
    const lockedColorsRef = useRef(lockedColors)
    const userIdRef = useRef(userId)

    useEffect(() => {
        writeOwnOnlyRef.current = writeOwnOnly
    }, [writeOwnOnly])

    useEffect(() => {
        canUseColorRef.current = canUseColor
        lockedColorsRef.current = lockedColors
        userIdRef.current = userId
    }, [canUseColor, lockedColors, userId])

    useEffect(() => {
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

    const getSyncUrl = () => {
        if (process.env.NEXT_PUBLIC_SYNC_SERVER_URL) {
            return `${process.env.NEXT_PUBLIC_SYNC_SERVER_URL}/connect/${roomId}`
        }
        return `ws://localhost:5858/connect/${roomId}`
    }

    const handleColorLockClick = () => {
        const editor = editorRef.current
        if (!editor) return

        let currentColor = 'black'

        const selectedShapes = editor.getSelectedShapes()
        if (selectedShapes.length > 0) {
            const firstShape = selectedShapes[0] as any
            if (firstShape?.props?.color) {
                currentColor = firstShape.props.color
            }
        }

        setColorLockMode('lock')

        setSelectedColorForLock(currentColor)
        setShowColorLockDialog(true)
    }

    const handleColorLockConfirm = async ( color: string, password: string, addToast: ReturnType<typeof useToasts>['addToast'] ) => {
        const myLock = lockedColors.find(lock => lock.color === color && lock.userId === userId)

        let result
        if (myLock) {
            result = await unlockColor(color, password)
        } else {
            result = await lockColor(color, password)
        }

        if (result.success) {
            addToast({title: result.message, severity: 'success'})
            setShowColorLockDialog(false)
        } else {
            addToast({title: `Error: ${result.message}`, severity: 'error'})
        }
    }

    const store = useSync({
        uri: getSyncUrl(),
        assets: multiplayerAssets,
        userInfo: userId ? {
            id: userId,
            name: `User ${userId.slice(0, 8)}`,
            ...(myLockedColor ? {color: myLockedColor} : {}),
        } : undefined,
    })

    if (!roomId) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
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
                components={{
                    QuickActions: () => (
                        <CustomQuickActions
                            writeOwnOnly={writeOwnOnly}
                            onToggle={() => setWriteOwnOnly(!writeOwnOnly)}
                            onColorLock={handleColorLockClick}
                        />
                    ),
                    StylePanel: () => (
                        <CustomStylePanel/>
                    ),
                    InFrontOfTheCanvas: () => {
                        const {addToast} = useToasts()

                        useEffect(() => {
                            const handleShowToast = ( event: any ) => {
                                const {title, severity} = event.detail
                                addToast({title, severity})
                            }

                            window.addEventListener('show-toast', handleShowToast)
                            return () => window.removeEventListener('show-toast', handleShowToast)
                        }, [addToast])

                        return showColorLockDialog ? (
                            <ColorLockDialog
                                color={selectedColorForLock}
                                isLocking={colorLockMode === 'lock'}
                                onConfirm={( color, password ) => handleColorLockConfirm(color, password, addToast)}
                                onCancel={() => setShowColorLockDialog(false)}
                                lockedColors={lockedColors}
                            />
                        ) : null
                    },
                }}
                onMount={( editor ) => {
                    editorRef.current = editor
                    editor.registerExternalAssetHandler('url', unfurlBookmarkUrl)
                    editor.setCurrentTool('draw')

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

                    editor.getInitialMetaForShape = ( _shape ) => {
                        return {
                            ownerId: editor.user.getId(),
                        }
                    }

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

                    editor.sideEffects.registerBeforeChangeHandler('instance_page_state', ( _prev, next ) => {
                        if (!writeOwnOnlyRef.current || next.selectedShapeIds.length === 0) return next
                        next.selectedShapeIds = next.selectedShapeIds.filter(( id ) => {
                            const shape = editor.getShape(id)
                            if (!shape) return false
                            return !(shape.meta.ownerId !== editor.user.getId() && writeOwnOnlyRef.current)
                        })
                        return next
                    })

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

                    editor.sideEffects.registerBeforeDeleteHandler('shape', ( shape, source ) => {
                        if (source !== 'user') return
                        const currentUserId = editor.user.getId()
                        if (writeOwnOnlyRef.current && shape.meta.ownerId !== currentUserId) {
                            console.log('Shape owned by another user, preventing deletion')
                            return false
                        }
                        return
                    })

                }}
            />
        </div>
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
