import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-8">
                {/* 404 Badge */}
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20">
                    <span className="text-[#39FF14] text-sm font-mono font-semibold tracking-widest">404</span>
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-white font-space-grotesk">
                        Page Not Found
                    </h1>
                    <p className="text-[#A3A3A3] text-sm leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                {/* Action */}
                <Link
                    href="/"
                    className="inline-block px-6 py-2.5 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] font-medium text-sm hover:bg-[#39FF14]/20 transition-all duration-200 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                >
                    ← Back to GeneDose.ai
                </Link>
            </div>
        </div>
    )
}
