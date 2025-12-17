import { useEffect, useRef } from 'react'

interface BrowserNotificationOptions {
    enabled: boolean
}

export function useBrowserNotifications({ enabled }: BrowserNotificationOptions) {
    const hasPermissionRef = useRef<boolean>(false)

    useEffect(() => {
        if (!enabled || typeof window === 'undefined' || !('Notification' in window)) {
            return
        }

        // Request permission if not already granted
        if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                hasPermissionRef.current = permission === 'granted'
            })
        } else {
            hasPermissionRef.current = Notification.permission === 'granted'
        }
    }, [enabled])

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (!enabled || typeof window === 'undefined' || !('Notification' in window)) {
            return
        }

        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options,
            })
        } else if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    new Notification(title, {
                        icon: '/favicon.ico',
                        badge: '/favicon.ico',
                        ...options,
                    })
                }
            })
        }
    }

    return { sendNotification, hasPermission: hasPermissionRef.current }
}
