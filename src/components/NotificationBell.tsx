'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, BellRing, AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, Notification } from '@/providers/NotificationProvider'

const typeConfig: Record<Notification['type'], { icon: typeof AlertCircle; color: string; bg: string }> = {
    critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
}

function timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#39FF14]/30 transition-all duration-200"
                title="Notifications"
            >
                {unreadCount > 0 ? (
                    <BellRing className="w-5 h-5 text-[#39FF14]" />
                ) : (
                    <Bell className="w-5 h-5 text-[#D9D9D9]" />
                )}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-14 w-96 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <h3 className="font-space-grotesk font-bold text-[#D9D9D9]">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-[#39FF14] hover:underline">
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const cfg = typeConfig[n.type]
                                    const Icon = cfg.icon
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => markAsRead(n.id)}
                                            className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${!n.read ? 'bg-white/[0.03]' : ''}`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded-lg border ${cfg.bg}`}>
                                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-semibold ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                                    {!n.read && <span className="w-2 h-2 bg-[#39FF14] rounded-full flex-shrink-0" />}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.timestamp)}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
