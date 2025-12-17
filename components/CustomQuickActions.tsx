import {
    DefaultQuickActions,
    DefaultQuickActionsContent,
    TldrawUiMenuItem,
} from 'tldraw'

interface CustomQuickActionsProps {
    writeOwnOnly: boolean
    onToggle: () => void
    onColorLock: () => void
    onSettings: () => void
}

export function CustomQuickActions( {
                                         writeOwnOnly,
                                         onToggle,
                                         onColorLock,
                                         onSettings,
                                     }: CustomQuickActionsProps ) {
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
                id="notification-settings"
                icon="bell"
                onSelect={onSettings}
                label="Notification Settings"
            />
        </DefaultQuickActions>
    )
}
