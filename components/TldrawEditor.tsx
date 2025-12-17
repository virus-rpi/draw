'use client'

import { useEffect, useRef, useState } from 'react'
import { Editor, Tldraw, useToasts, useDialogs } from 'tldraw'
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
import { useBrowserNotifications } from './hooks/useBrowserNotifications'
import { NotificationSettingsDialog } from './NotificationSettingsDialog'
import './config/theme'



export default function TldrawEditor() {
    const { roomId, userId } = useRoomSetup()
    const [writeOwnOnly, setWriteOwnOnly] = useState<boolean>(true)
    const editorRef = useRef<Editor | null>(null)
    const toastAddRef = useRef<ReturnType<typeof useToasts>['addToast'] | null>(null)
    const dialogsRef = useRef<ReturnType<typeof useDialogs> | null>(null)

    const colorLock = useColorLock(roomId, userId)
    const {myLockedColor, lockColor, unlockColor, canUseColor, lockedColors} = colorLock

    const { setupEditorHandlers } = useEditorHandlers({
        writeOwnOnly,
        canUseColor,
        lockedColors,
        userId,
    })

    const { settings, updateSettings } = useNotificationSettings()
    const { sendNotification } = useBrowserNotifications({ enabled: settings.notifyOnDraw })

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
        onDrawWhileAwayBrowser: () => {
            sendNotification('Draw - New Activity', {
                body: 'Someone drew while you were away',
                tag: 'draw-notification',
                requireInteraction: false,
            })
        },
    })



    const handleColorLockClick = () => {
        const editor = editorRef.current
        const dialogs = dialogsRef.current
        if (!editor || !dialogs) return

        let currentColor = 'black'

        const selectedShapes = editor.getSelectedShapes()
        if (selectedShapes.length > 0) {
            const firstShape = selectedShapes[0] as any
            if (firstShape?.props?.color) {
                currentColor = firstShape.props.color
            }
        }

        dialogs.addDialog({
            component: ({ onClose }) => (
                <ColorLockDialog
                    color={currentColor}
                    isLocking={true}
                    onConfirm={async (color, password) => {
                        const myLock = lockedColors.find(lock => lock.color === color && lock.userId === userId)
                        let result
                        if (myLock) {
                            result = await unlockColor(color, password)
                        } else {
                            result = await lockColor(color, password)
                        }
                        if (result.success) {
                            toastAddRef.current?.({title: result.message, severity: 'success'})
                            onClose()
                        } else {
                            toastAddRef.current?.({title: `Error: ${result.message}`, severity: 'error'})
                        }
                    }}
                    onClose={onClose}
                    lockedColors={lockedColors}
                />
            ),
        })
    }

    const handleSettingsClick = () => {
        const dialogs = dialogsRef.current
        if (!dialogs) return

        dialogs.addDialog({
            component: ({ onClose }) => (
                <NotificationSettingsDialog
                    settings={settings}
                    onUpdate={updateSettings}
                    onClose={onClose}
                />
            ),
        })
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
                            onSettings={handleSettingsClick}
                        />
                    ),
                    StylePanel: () => (
                        <CustomStylePanel/>
                    ),
                    InFrontOfTheCanvas: () => {
                        const {addToast} = useToasts()
                        const dialogs = useDialogs()

                        useEffect(() => {
                            toastAddRef.current = addToast
                            dialogsRef.current = dialogs
                        }, [addToast, dialogs])

                        useEffect(() => {
                            const handleShowToast = ( event: any ) => {
                                const {title, severity} = event.detail
                                addToast({title, severity})
                            }

                            window.addEventListener('show-toast', handleShowToast)
                            return () => window.removeEventListener('show-toast', handleShowToast)
                        }, [addToast])

                        return null
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
