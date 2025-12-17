import {
    DefaultQuickActions,
    DefaultQuickActionsContent,
    TldrawUiMenuItem,
} from 'tldraw'

interface CustomQuickActionsProps {
    writeOwnOnly: boolean
    onToggle: () => void
    onColorLock: () => void
}

export function CustomQuickActions( {
                                         writeOwnOnly,
                                         onToggle,
                                         onColorLock,
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
        </DefaultQuickActions>
    )
}
