'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    History, Clock, Search, Filter, Eye, Trash2, FileText,
    ChevronDown, Calendar, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react'
import Link from 'next/link'
import SeverityBadge from '@/components/SeverityBadge'

// Mock past analyses stored in memory
const MOCK_HISTORY = [
    {
        id: 'ANL-20260219-001',
        date: '2026-02-19T14:30:00Z',
        patientName: 'John Doe',
        drugs: ['codeine', 'warfarin', 'simvastatin'],
        genesAnalyzed: 4,
        highestRisk: 'toxic',
        status: 'completed',
    },
    {
        id: 'ANL-20260218-003',
        date: '2026-02-18T09:15:00Z',
        patientName: 'Jane Smith',
        drugs: ['clopidogrel'],
        genesAnalyzed: 2,
        highestRisk: 'adjust',
        status: 'completed',
    },
    {
        id: 'ANL-20260217-007',
        date: '2026-02-17T16:45:00Z',
        patientName: 'Robert Wilson',
        drugs: ['azathioprine', 'fluorouracil'],
        genesAnalyzed: 3,
        highestRisk: 'safe',
        status: 'completed',
    },
    {
        id: 'ANL-20260215-012',
        date: '2026-02-15T11:20:00Z',
        patientName: 'Emily Brown',
        drugs: ['codeine', 'tramadol'],
        genesAnalyzed: 2,
        highestRisk: 'toxic',
        status: 'completed',
    },
    {
        id: 'ANL-20260214-005',
        date: '2026-02-14T08:00:00Z',
        patientName: 'Michael Lee',
        drugs: ['warfarin'],
        genesAnalyzed: 3,
        highestRisk: 'adjust',
        status: 'completed',
    },
    {
        id: 'ANL-20260210-021',
        date: '2026-02-10T13:10:00Z',
        patientName: 'Sarah Garcia',
        drugs: ['simvastatin', 'atorvastatin'],
        genesAnalyzed: 1,
        highestRisk: 'safe',
        status: 'completed',
    },
]

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [riskFilter, setRiskFilter] = useState<string>('all')

    const filtered = MOCK_HISTORY.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.drugs.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRisk = riskFilter === 'all' || item.highestRisk === riskFilter
        return matchesSearch && matchesRisk
    })

    return (
        <div className="min-h-screen bg-black text-[#D9D9D9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center">
                            <History className="w-5 h-5 text-[#39FF14]" />
                        </div>
                        <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Analysis History</h1>
                    </div>
                    <p className="text-lg text-gray-400 mt-2">View and manage past pharmacogenomic analyses</p>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-4 mb-8"
                >
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by patient, drug, or analysis ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#D9D9D9] placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#D9D9D9] focus:outline-none focus:border-[#39FF14]/50"
                        >
                            <option value="all">All Risks</option>
                            <option value="safe">Safe</option>
                            <option value="adjust">Adjust</option>
                            <option value="toxic">Toxic</option>
                            <option value="ineffective">Ineffective</option>
                        </select>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Analyses', value: MOCK_HISTORY.length, icon: FileText, color: 'text-[#39FF14]' },
                        { label: 'High Risk', value: MOCK_HISTORY.filter(h => h.highestRisk === 'toxic').length, icon: AlertTriangle, color: 'text-red-400' },
                        { label: 'Adjustments', value: MOCK_HISTORY.filter(h => h.highestRisk === 'adjust').length, icon: XCircle, color: 'text-yellow-400' },
                        { label: 'Safe', value: MOCK_HISTORY.filter(h => h.highestRisk === 'safe').length, icon: CheckCircle, color: 'text-green-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            className="glass rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <span className={`text-2xl font-bold font-space-grotesk ${stat.color}`}>{stat.value}</span>
                            </div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Analysis ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Drugs</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Genes</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No analyses match your search criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item, i) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * i }}
                                            className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-[#39FF14]">{item.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-[#D9D9D9]">{item.patientName}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.drugs.map(d => (
                                                        <span key={d} className="px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded-full text-gray-300 capitalize">{d}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{item.genesAnalyzed}</td>
                                            <td className="px-6 py-4">
                                                <SeverityBadge riskCategory={item.highestRisk as any} size="sm" showIcon />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href="/dashboard">
                                                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="View">
                                                            <Eye className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
