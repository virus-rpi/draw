import { useEffect, useState } from 'react'

export interface NotificationSettings {
    notifyOnDraw: boolean
    notifyOnJoinLeave: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
    notifyOnDraw: true,
    notifyOnJoinLeave: true,
}

const SETTINGS_KEY = 'draw-notification-settings'

export function useNotificationSettings() {
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)

    useEffect(() => {
        const stored = localStorage.getItem(SETTINGS_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setSettings({ ...DEFAULT_SETTINGS, ...parsed })
            } catch (e) {
                console.error('Failed to parse notification settings:', e)
            }
        }
    }, [])

    const updateSettings = (newSettings: Partial<NotificationSettings>) => {
        const updated = { ...settings, ...newSettings }
        setSettings(updated)
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    }

    return { settings, updateSettings }
}
