import { useState } from 'react'

interface CustomColorPickerProps {
    onColorSelect: (color: string) => void
    onClose: () => void
}

export function CustomColorPicker({ onColorSelect, onClose }: CustomColorPickerProps) {
    const [customColor, setCustomColor] = useState('#000000')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onColorSelect(customColor)
        onClose()
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
            onClick={onClose}
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
                    Choose Custom Color
                </h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                            Select color:
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                style={{
                                    width: '60px',
                                    height: '40px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            />
                            <input
                                type="text"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                placeholder="#000000"
                                pattern="^#[0-9A-Fa-f]{6}$"
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
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
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            Select
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
