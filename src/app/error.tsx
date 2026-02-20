'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white font-space-grotesk">
                        Something went wrong
                    </h2>
                    <p className="text-[#A3A3A3] text-sm leading-relaxed">
                        An unexpected error occurred. This could be a temporary issue — try again or return to the home page.
                    </p>
                    {error?.digest && (
                        <p className="text-xs text-[#555] font-mono mt-2">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] font-medium text-sm hover:bg-[#39FF14]/20 transition-all duration-200 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[#D9D9D9] font-medium text-sm hover:bg-white/10 transition-all duration-200"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    )
}
