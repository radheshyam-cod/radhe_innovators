'use client'

import { useState } from 'react'
import { Copy, ClipboardCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CopyButtonProps {
    text: string
    label?: string
    className?: string
}

export default function CopyButton({ text, label, className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback
            const ta = document.createElement('textarea')
            ta.value = text
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
        ${copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-[#D9D9D9] border border-white/10 hover:bg-white/10 hover:border-[#39FF14]/30'
                } ${className}`}
            title="Copy to clipboard"
        >
            <AnimatePresence mode="wait">
                {copied ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Copied!</span>
                    </motion.span>
                ) : (
                    <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                        <Copy className="w-4 h-4" />
                        <span>{label || 'Copy'}</span>
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    )
}
