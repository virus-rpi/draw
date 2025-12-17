import React, { useState } from 'react'
import {
    TldrawUiButton,
    TldrawUiButtonLabel,
    TldrawUiDialogBody,
    TldrawUiDialogCloseButton,
    TldrawUiDialogFooter,
    TldrawUiDialogHeader,
    TldrawUiDialogTitle,
} from 'tldraw'

interface ColorLockDialogProps {
    color: string
    isLocking: boolean
    onConfirm: ( color: string, password: string ) => void
    onClose: () => void
    lockedColors?: Array<{ color: string; userId: string }>
}

const PRESET_COLORS = [
    {name: 'black', label: 'Black', value: 'black'},
    {name: 'grey', label: 'Grey', value: 'grey'},
    {name: 'light-violet', label: 'Light Violet', value: 'light-violet'},
    {name: 'violet', label: 'Violet', value: 'violet'},
    {name: 'blue', label: 'Blue', value: 'blue'},
    {name: 'light-blue', label: 'Light Blue', value: 'light-blue'},
    {name: 'yellow', label: 'Yellow', value: 'yellow'},
    {name: 'orange', label: 'Orange', value: 'orange'},
    {name: 'green', label: 'Green', value: 'green'},
    {name: 'light-green', label: 'Light Green', value: 'light-green'},
    {name: 'light-red', label: 'Light Red', value: 'light-red'},
    {name: 'red', label: 'Finn Red', value: 'red'},
]

export function ColorLockDialog( {color, isLocking, onConfirm, onClose, lockedColors = []}: ColorLockDialogProps ) {
    const [password, setPassword] = useState('')
    const [selectedColor, setSelectedColor] = useState(color)

    const isColorLocked = ( colorValue: string ) => {
        return lockedColors.some(lock => lock.color === colorValue)
    }

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault()
        if (password && selectedColor) {
            onConfirm(selectedColor, password)
            setPassword('')
        }
    }

    return (
        <>
            <TldrawUiDialogHeader>
                <TldrawUiDialogTitle>Lock / Unlock / Take Over Color</TldrawUiDialogTitle>
                <TldrawUiDialogCloseButton />
            </TldrawUiDialogHeader>
            <TldrawUiDialogBody style={{maxWidth: '400px'}}>
                <p style={{margin: '0 0 16px 0', fontSize: '14px', color: '#666'}}>
                    Enter the password to lock or take over a color. Use the same password to unlock it later.
                </p>
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '16px'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>
                            Select color:
                        </label>
                        <select
                            value={selectedColor}
                            onChange={( e ) => setSelectedColor(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid var(--color-panel)',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                backgroundColor: 'var(--color-panel)',
                                color: 'var(--color-text)',
                            }}
                        >
                            {PRESET_COLORS.map(( c ) => (
                                <option key={c.value} value={c.value}>
                                    {c.label} {isColorLocked(c.value) ? '🔒' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={( e ) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid var(--color-panel)',
                            borderRadius: '4px',
                            fontSize: '14px',
                            marginBottom: '16px',
                            boxSizing: 'border-box',
                            backgroundColor: 'var(--color-panel)',
                            color: 'var(--color-text)',
                        }}
                        autoFocus
                    />
                </form>
            </TldrawUiDialogBody>
            <TldrawUiDialogFooter className="tlui-dialog__footer__actions">
                <TldrawUiButton type="normal" onClick={onClose}>
                    <TldrawUiButtonLabel>Cancel</TldrawUiButtonLabel>
                </TldrawUiButton>
                <TldrawUiButton 
                    type="primary" 
                    disabled={!password || !selectedColor}
                    onClick={handleSubmit}
                >
                    <TldrawUiButtonLabel>
                        {isColorLocked(selectedColor) ? 'Unlock / Take Over' : 'Lock'}
                    </TldrawUiButtonLabel>
                </TldrawUiButton>
            </TldrawUiDialogFooter>
        </>
    )
}
