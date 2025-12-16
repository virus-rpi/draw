import { useState } from 'react'

interface ColorLockDialogProps {
    color: string
    isLocking: boolean
    onConfirm: (password: string) => void
    onCancel: () => void
}

export function ColorLockDialog({ color, isLocking, onConfirm, onCancel }: ColorLockDialogProps) {
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (password) {
            onConfirm(password)
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
                    minWidth: '300px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
                    {isLocking ? `Lock ${color} color` : `Unlock ${color} color`}
                </h2>
                <form onSubmit={handleSubmit}>
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
                            disabled={!password}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: password ? '#007bff' : '#ccc',
                                color: 'white',
                                cursor: password ? 'pointer' : 'not-allowed',
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
