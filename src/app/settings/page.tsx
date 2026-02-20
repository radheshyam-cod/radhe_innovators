'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, SlidersHorizontal, Bell, Palette, User, Shield, Save, Check } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme()
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState({
        defaultDrugs: ['codeine', 'warfarin'],
        emailNotifications: true,
        criticalAlerts: true,
        guidelineUpdates: true,
        autoExportPDF: false,
        language: 'en',
    })

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

    return (
        <div className="min-h-screen bg-black text-[#D9D9D9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-500/10 border border-gray-500/20 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </div>
                        <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Settings</h1>
                    </div>
                    <p className="text-lg text-gray-400 mt-2">Manage your preferences</p>
                </motion.div>

                <div className="space-y-6">
                    {/* Appearance */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
                        <h2 className="font-space-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-purple-400" /> Appearance
                        </h2>
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <div><p className="font-medium">Theme</p><p className="text-sm text-gray-500">Switch between dark and light mode</p></div>
                            <button onClick={toggleTheme} className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#39FF14]/30' : 'bg-gray-600'}`}>
                                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${theme === 'dark' ? 'left-0.5' : 'left-7'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div><p className="font-medium">Language</p><p className="text-sm text-gray-500">Select display language</p></div>
                            <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#39FF14]/50">
                                <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="hi">हिन्दी</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6">
                        <h2 className="font-space-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-yellow-400" /> Notifications
                        </h2>
                        {[
                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive reports via email' },
                            { key: 'criticalAlerts', label: 'Critical Alerts', desc: 'High-risk drug interaction alerts' },
                            { key: 'guidelineUpdates', label: 'Guideline Updates', desc: 'CPIC guideline change notifications' },
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div><p className="font-medium">{item.label}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
                                <button onClick={() => setSettings({ ...settings, [item.key]: !(settings as any)[item.key] })}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${(settings as any)[item.key] ? 'bg-[#39FF14]/30' : 'bg-gray-600'}`}>
                                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${(settings as any)[item.key] ? 'left-7' : 'left-0.5'}`} />
                                </button>
                            </div>
                        ))}
                    </motion.div>

                    {/* Analysis Defaults */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-6">
                        <h2 className="font-space-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5 text-blue-400" /> Analysis Defaults
                        </h2>
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <div><p className="font-medium">Auto-export PDF</p><p className="text-sm text-gray-500">Automatically generate PDF after analysis</p></div>
                            <button onClick={() => setSettings({ ...settings, autoExportPDF: !settings.autoExportPDF })}
                                className={`relative w-14 h-7 rounded-full transition-colors ${settings.autoExportPDF ? 'bg-[#39FF14]/30' : 'bg-gray-600'}`}>
                                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${settings.autoExportPDF ? 'left-7' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </motion.div>

                    {/* Security */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl p-6">
                        <h2 className="font-space-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-400" /> Security
                        </h2>
                        <p className="text-sm text-gray-500 mb-3">Data is encrypted in transit and at rest. Zero-retention policy for genomic data.</p>
                        <div className="flex items-center gap-2 text-xs text-[#39FF14]">
                            <Check className="w-4 h-4" /> HIPAA Compliant
                        </div>
                    </motion.div>

                    {/* Save */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <button onClick={handleSave}
                            className={`w-full py-3 rounded-xl font-space-grotesk font-bold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#39FF14] text-black hover:bg-[#32d912]'}`}>
                            {saved ? <><Check className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> Save Preferences</>}
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
