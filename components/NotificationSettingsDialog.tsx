'use client'

import {
    TldrawUiButton,
    TldrawUiButtonLabel,
    TldrawUiDialogBody,
    TldrawUiDialogCloseButton,
    TldrawUiDialogFooter,
    TldrawUiDialogHeader,
    TldrawUiDialogTitle,
} from 'tldraw'
import { NotificationSettings } from './hooks/useNotificationSettings'

interface NotificationSettingsDialogProps {
    settings: NotificationSettings
    onUpdate: (settings: Partial<NotificationSettings>) => void
    onClose: () => void
}

export function NotificationSettingsDialog({
    settings,
    onUpdate,
    onClose,
}: NotificationSettingsDialogProps) {
    return (
        <>
            <TldrawUiDialogHeader>
                <TldrawUiDialogTitle>Notification Settings</TldrawUiDialogTitle>
                <TldrawUiDialogCloseButton />
            </TldrawUiDialogHeader>
            <TldrawUiDialogBody style={{maxWidth: '400px'}}>
                <div style={{ marginBottom: '16px' }}>
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={settings.notifyOnDraw}
                            onChange={(e) =>
                                onUpdate({ notifyOnDraw: e.target.checked })
                            }
                            style={{
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                            }}
                        />
                        <span>Notify when someone draws while I'm away</span>
                    </label>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={settings.notifyOnJoinLeave}
                            onChange={(e) =>
                                onUpdate({ notifyOnJoinLeave: e.target.checked })
                            }
                            style={{
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                            }}
                        />
                        <span>Show join/leave messages</span>
                    </label>
                </div>
            </TldrawUiDialogBody>
            <TldrawUiDialogFooter className="tlui-dialog__footer__actions">
                <TldrawUiButton type="primary" onClick={onClose}>
                    <TldrawUiButtonLabel>Close</TldrawUiButtonLabel>
                </TldrawUiButton>
            </TldrawUiDialogFooter>
        </>
    )
}
