import { useState } from 'react'

interface ColorLockDialogProps {
    color: string
    isLocking: boolean
    onConfirm: (color: string, password: string) => void
    onCancel: () => void
}

const PRESET_COLORS = [
    { name: 'black', label: 'Black', value: 'black' },
    { name: 'grey', label: 'Grey', value: 'grey' },
    { name: 'light-violet', label: 'Light Violet', value: 'light-violet' },
    { name: 'violet', label: 'Violet', value: 'violet' },
    { name: 'blue', label: 'Blue', value: 'blue' },
    { name: 'light-blue', label: 'Light Blue', value: 'light-blue' },
    { name: 'yellow', label: 'Yellow', value: 'yellow' },
    { name: 'orange', label: 'Orange', value: 'orange' },
    { name: 'green', label: 'Green', value: 'green' },
    { name: 'light-green', label: 'Light Green', value: 'light-green' },
    { name: 'light-red', label: 'Light Red', value: 'light-red' },
    { name: 'red', label: 'Red', value: 'red' },
]

export function ColorLockDialog({ color, isLocking, onConfirm, onCancel }: ColorLockDialogProps) {
    const [password, setPassword] = useState('')
    const [selectedColor, setSelectedColor] = useState(color)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (password && selectedColor) {
            onConfirm(selectedColor, password)
            setPassword('')
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    minWidth: '350px',
                    maxWidth: '400px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
                    {isLocking ? 'Lock Color' : 'Unlock Color'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                            Select color:
                        </label>
                        <select
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        >
                            {PRESET_COLORS.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            marginBottom: '16px',
                            boxSizing: 'border-box',
                        }}
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!password || !selectedColor}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: (password && selectedColor) ? '#007bff' : '#ccc',
                                color: 'white',
                                cursor: (password && selectedColor) ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                            }}
                        >
                            {isLocking ? 'Lock' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
