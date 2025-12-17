'use client'

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
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                    }}
                >
                    Notification Settings
                </h2>

                <div style={{ marginBottom: '16px' }}>
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#333',
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

                <div style={{ marginBottom: '24px' }}>
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#333',
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

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007aff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
