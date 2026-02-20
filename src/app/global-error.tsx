'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, backgroundColor: '#000', color: '#D9D9D9', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
                        {/* Icon */}
                        <div style={{
                            margin: '0 auto 2rem',
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                        }}>
                            ⚠️
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                            Critical Error
                        </h2>
                        <p style={{ color: '#A3A3A3', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            A critical error has occurred. Please try refreshing the page.
                        </p>

                        <button
                            onClick={reset}
                            style={{
                                padding: '0.625rem 1.5rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'rgba(57, 255, 20, 0.1)',
                                border: '1px solid rgba(57, 255, 20, 0.3)',
                                color: '#39FF14',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                            }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
