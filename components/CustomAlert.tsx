import { useEffect } from 'react'

interface CustomAlertProps {
    message: string
    onClose: () => void
    type?: 'info' | 'success' | 'error'
}

const Z_INDEX_ALERT = 10001

export function CustomAlert( {message, onClose, type = 'info'}: CustomAlertProps ) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 10000)

        return () => clearTimeout(timer)
    }, [])

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#4caf50'
            case 'error':
                return '#f44336'
            default:
                return '#2196f3'
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: getBackgroundColor(),
                color: 'white',
                padding: '16px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: Z_INDEX_ALERT,
                minWidth: '300px',
                maxWidth: '600px',
                animation: 'slideDown 0.3s ease-out',
            }}
        >
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{flex: 1, paddingRight: '16px'}}>
                    {message}
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '18px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                    }}
                >
                    ×
                </button>
            </div>
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        transform: translateX(-50%) translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    )
}
