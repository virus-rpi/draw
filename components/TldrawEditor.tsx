'use client'

import { useEffect, useRef, useState } from 'react'
import { Editor, Tldraw, useToasts } from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { useColorLock } from './useColorLock'
import { ColorLockDialog } from './ColorLockDialog'
import { CustomQuickActions } from './CustomQuickActions'
import { CustomStylePanel } from './CustomStylePanel'
import { multiplayerAssets } from './stores/multiplayerAssets'
import { unfurlBookmarkUrl } from './utils/unfurlBookmark'
import { getEmbedConfigs } from './utils/embedConfig'
import { getSyncUrl } from './utils/syncUrl'
import { useRoomSetup } from './hooks/useRoomSetup'
import { useEditorHandlers } from './hooks/useEditorHandlers'
import { useNotificationSettings } from './hooks/useNotificationSettings'
import { useCollaboratorNotifications } from './hooks/useCollaboratorNotifications'
import { usePageVisibility } from './hooks/usePageVisibility'
import { NotificationSettingsDialog } from './NotificationSettingsDialog'
import './config/theme'



export default function TldrawEditor() {
    const { roomId, userId } = useRoomSetup()
    const [writeOwnOnly, setWriteOwnOnly] = useState<boolean>(true)
    const [showColorLockDialog, setShowColorLockDialog] = useState(false)
    const [colorLockMode, setColorLockMode] = useState<'lock' | 'unlock'>('lock')
    const [selectedColorForLock, setSelectedColorForLock] = useState<string>('')
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)
    const editorRef = useRef<Editor | null>(null)
    const toastAddRef = useRef<ReturnType<typeof useToasts>['addToast'] | null>(null)

    const colorLock = useColorLock(roomId, userId)
    const {myLockedColor, lockColor, unlockColor, canUseColor, lockedColors} = colorLock

    const { setupEditorHandlers } = useEditorHandlers({
        writeOwnOnly,
        canUseColor,
        lockedColors,
        userId,
    })

    const { settings, updateSettings } = useNotificationSettings()

    // Handle collaborator join/leave notifications
    useCollaboratorNotifications({
        editor: editorRef.current,
        enabled: settings.notifyOnJoinLeave,
        onJoin: (presence) => {
            toastAddRef.current?.({
                title: `${presence.userName || 'A user'} joined`,
                severity: 'info',
            })
        },
        onLeave: (presence) => {
            toastAddRef.current?.({
                title: `${presence.userName || 'A user'} left`,
                severity: 'info',
            })
        },
    })

    // Handle page visibility and draw notifications
    usePageVisibility({
        editor: editorRef.current,
        enabled: settings.notifyOnDraw,
        onDrawWhileAway: () => {
            toastAddRef.current?.({
                title: 'Someone drew while you were away',
                severity: 'info',
            })
        },
    })



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
        uri: getSyncUrl(roomId),
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
                embeds={getEmbedConfigs()}
                components={{
                    QuickActions: () => (
                        <CustomQuickActions
                            writeOwnOnly={writeOwnOnly}
                            onToggle={() => setWriteOwnOnly(!writeOwnOnly)}
                            onColorLock={handleColorLockClick}
                            onSettings={() => setShowSettingsDialog(true)}
                        />
                    ),
                    StylePanel: () => (
                        <CustomStylePanel/>
                    ),
                    InFrontOfTheCanvas: () => {
                        const {addToast} = useToasts()

                        useEffect(() => {
                            toastAddRef.current = addToast
                        }, [addToast])

                        useEffect(() => {
                            const handleShowToast = ( event: any ) => {
                                const {title, severity} = event.detail
                                addToast({title, severity})
                            }

                            window.addEventListener('show-toast', handleShowToast)
                            return () => window.removeEventListener('show-toast', handleShowToast)
                        }, [addToast])

                        return (
                            <>
                                {showColorLockDialog && (
                                    <ColorLockDialog
                                        color={selectedColorForLock}
                                        isLocking={colorLockMode === 'lock'}
                                        onConfirm={( color, password ) => handleColorLockConfirm(color, password, addToast)}
                                        onCancel={() => setShowColorLockDialog(false)}
                                        lockedColors={lockedColors}
                                    />
                                )}
                                {showSettingsDialog && (
                                    <NotificationSettingsDialog
                                        settings={settings}
                                        onUpdate={updateSettings}
                                        onClose={() => setShowSettingsDialog(false)}
                                    />
                                )}
                            </>
                        )
                    },
                }}
                onMount={( editor ) => {
                    editorRef.current = editor
                    editor.registerExternalAssetHandler('url', unfurlBookmarkUrl)
                    editor.setCurrentTool('draw')
                    setupEditorHandlers(editor)
                }}
            />
        </div>
    )
}
