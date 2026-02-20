'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, ShieldCheck, Activity, Search, ChevronRight, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react'

const MOCK_USERS = [
    { id: 'U-001', name: 'Dr. Sarah Chen', email: 'sarah@example.com', role: 'clinician', status: 'active', lastLogin: '2026-02-19T14:30:00Z', analyses: 42 },
    { id: 'U-002', name: 'James Park', email: 'james@example.com', role: 'admin', status: 'active', lastLogin: '2026-02-20T01:15:00Z', analyses: 18 },
    { id: 'U-003', name: 'Dr. Maria Rodriguez', email: 'maria@example.com', role: 'pharmacist', status: 'active', lastLogin: '2026-02-18T09:45:00Z', analyses: 35 },
    { id: 'U-004', name: 'Emily Brown', email: 'emily@example.com', role: 'researcher', status: 'inactive', lastLogin: '2026-01-15T16:00:00Z', analyses: 7 },
]

const AUDIT_LOGS = [
    { time: '2026-02-20T01:15:00Z', user: 'James Park', action: 'Logged in', level: 'info' },
    { time: '2026-02-19T14:32:00Z', user: 'Dr. Sarah Chen', action: 'Ran analysis for codeine, warfarin', level: 'info' },
    { time: '2026-02-19T14:30:00Z', user: 'Dr. Sarah Chen', action: 'Uploaded VCF file (sample_patient.vcf)', level: 'info' },
    { time: '2026-02-18T09:46:00Z', user: 'Dr. Maria Rodriguez', action: 'Exported PDF report #ANL-018', level: 'info' },
    { time: '2026-02-17T11:00:00Z', user: 'System', action: 'CPIC database updated to v3.2', level: 'warning' },
]

export default function AdminPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const filtered = MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="min-h-screen bg-black text-[#D9D9D9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-red-400" />
                        </div>
                        <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Admin Panel</h1>
                    </div>
                    <p className="text-lg text-gray-400 mt-2">System administration and user management</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Users', value: MOCK_USERS.length, icon: Users, color: 'text-blue-400' },
                        { label: 'Active', value: MOCK_USERS.filter(u => u.status === 'active').length, icon: CheckCircle, color: 'text-green-400' },
                        { label: 'Total Analyses', value: MOCK_USERS.reduce((s, u) => s + u.analyses, 0), icon: Activity, color: 'text-[#39FF14]' },
                        { label: 'System Health', value: '99.9%', icon: ShieldCheck, color: 'text-[#39FF14]' },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                            className="glass rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <span className={`text-2xl font-bold font-space-grotesk ${stat.color}`}>{stat.value}</span>
                            </div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Users Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="font-space-grotesk font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> User Management</h2>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#39FF14]/50 w-48" />
                            </div>
                        </div>
                        <table className="w-full">
                            <thead><tr className="border-b border-white/10">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Analyses</th>
                            </tr></thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                                        <td className="px-6 py-3"><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></td>
                                        <td className="px-6 py-3"><span className="px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded-full capitalize">{u.role}</span></td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs ${u.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} />{u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{u.analyses}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>

                    {/* Audit Logs */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h2 className="font-space-grotesk font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /> Audit Log</h2>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {AUDIT_LOGS.map((log, i) => (
                                <div key={i} className="px-4 py-3 border-b border-white/5 hover:bg-white/[0.03]">
                                    <div className="flex items-start gap-2">
                                        {log.level === 'warning' ? <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />}
                                        <div>
                                            <p className="text-xs text-gray-300">{log.action}</p>
                                            <p className="text-[10px] text-gray-600">{log.user} • {new Date(log.time).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
