'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export interface Notification {
    id: string
    type: 'critical' | 'warning' | 'info' | 'success'
    title: string
    message: string
    timestamp: Date
    read: boolean
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'critical',
        title: 'High-Risk Interaction Detected',
        message: 'CYP2D6 Poor Metabolizer detected for codeine — avoid prescribing.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
    },
    {
        id: '2',
        type: 'info',
        title: 'CPIC Guideline Update',
        message: 'New CPIC guideline for CYP2C19 and clopidogrel published (v3.2).',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
    },
    {
        id: '3',
        type: 'warning',
        title: 'Dosage Adjustment Reminder',
        message: 'Patient #1042 — warfarin dose review due in 7 days.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
    },
    {
        id: '4',
        type: 'success',
        title: 'Analysis Completed',
        message: 'Polypharmacy analysis for 3 drugs completed successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        read: true,
    },
]

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)

    const unreadCount = notifications.filter(n => !n.read).length

    const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        setNotifications(prev => [
            { ...n, id: Date.now().toString(), timestamp: new Date(), read: false },
            ...prev,
        ])
    }, [])

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }, [])

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }, [])

    const clearAll = useCallback(() => setNotifications([]), [])

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => {
    const ctx = useContext(NotificationContext)
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
    return ctx
}
