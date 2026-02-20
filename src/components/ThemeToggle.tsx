'use client'

import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/providers/ThemeProvider'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#39FF14]/30 transition-all duration-200"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                    <Moon className="w-5 h-5 text-indigo-400" />
                )}
            </motion.div>
        </button>
    )
}
