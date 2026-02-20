'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, Columns, ArrowLeftRight, ChevronDown, Dna, AlertTriangle, CheckCircle } from 'lucide-react'
import SeverityBadge from '@/components/SeverityBadge'

const MOCK_ANALYSES = [
    {
        id: 'ANL-001', date: '2026-02-19', patient: 'John Doe',
        genes: [
            { gene: 'CYP2D6', phenotype: 'Poor Metabolizer', risk: 'toxic', drug: 'codeine' },
            { gene: 'CYP2C9', phenotype: 'Intermediate Metabolizer', risk: 'adjust', drug: 'warfarin' },
            { gene: 'SLCO1B1', phenotype: 'Normal Function', risk: 'safe', drug: 'simvastatin' },
        ],
    },
    {
        id: 'ANL-002', date: '2026-02-18', patient: 'Jane Smith',
        genes: [
            { gene: 'CYP2D6', phenotype: 'Normal Metabolizer', risk: 'safe', drug: 'codeine' },
            { gene: 'CYP2C9', phenotype: 'Poor Metabolizer', risk: 'toxic', drug: 'warfarin' },
            { gene: 'SLCO1B1', phenotype: 'Decreased Function', risk: 'adjust', drug: 'simvastatin' },
        ],
    },
    {
        id: 'ANL-003', date: '2026-02-15', patient: 'Robert Wilson',
        genes: [
            { gene: 'CYP2D6', phenotype: 'Ultrarapid Metabolizer', risk: 'toxic', drug: 'codeine' },
            { gene: 'TPMT', phenotype: 'Normal Metabolizer', risk: 'safe', drug: 'azathioprine' },
        ],
    },
]

export default function ComparePage() {
    const [leftId, setLeftId] = useState('')
    const [rightId, setRightId] = useState('')

    const leftAnalysis = MOCK_ANALYSES.find(a => a.id === leftId)
    const rightAnalysis = MOCK_ANALYSES.find(a => a.id === rightId)

    const allGenes = leftAnalysis && rightAnalysis
        ? [...new Set([...leftAnalysis.genes.map(g => g.gene), ...rightAnalysis.genes.map(g => g.gene)])]
        : []

    return (
        <div className="min-h-screen bg-black text-[#D9D9D9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <GitCompare className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Compare Analyses</h1>
                    </div>
                    <p className="text-lg text-gray-400 mt-2">Side-by-side comparison of pharmacogenomic results</p>
                </motion.div>

                {/* Selectors */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {[
                        { label: 'Analysis A', value: leftId, onChange: setLeftId },
                        { label: 'Analysis B', value: rightId, onChange: setRightId },
                    ].map((sel, i) => (
                        <div key={i} className="glass rounded-xl p-4">
                            <label className="text-sm text-gray-400 mb-2 block">{sel.label}</label>
                            <div className="relative">
                                <select value={sel.value} onChange={(e) => sel.onChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#D9D9D9] focus:outline-none focus:border-[#39FF14]/50 appearance-none">
                                    <option value="">Select analysis...</option>
                                    {MOCK_ANALYSES.map(a => <option key={a.id} value={a.id}>{a.id} — {a.patient} ({a.date})</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Comparison */}
                {leftAnalysis && rightAnalysis ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {/* Header Row */}
                        <div className="grid grid-cols-3 gap-4 mb-4 px-4">
                            <div className="text-sm font-semibold text-gray-400">Gene</div>
                            <div className="text-sm font-semibold text-center text-blue-400">{leftAnalysis.patient}</div>
                            <div className="text-sm font-semibold text-center text-purple-400">{rightAnalysis.patient}</div>
                        </div>

                        {/* Gene Rows */}
                        <div className="space-y-3">
                            {allGenes.map((gene, i) => {
                                const left = leftAnalysis.genes.find(g => g.gene === gene)
                                const right = rightAnalysis.genes.find(g => g.gene === gene)
                                const isDifferent = left?.risk !== right?.risk

                                return (
                                    <motion.div
                                        key={gene}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                        className={`grid grid-cols-3 gap-4 glass rounded-xl p-4 ${isDifferent ? 'border-yellow-500/30' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Dna className="w-4 h-4 text-[#39FF14]" />
                                            <span className="font-mono font-semibold">{gene}</span>
                                            {isDifferent && <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" title="Different results" />}
                                        </div>
                                        {[left, right].map((data, j) => (
                                            <div key={j} className="text-center">
                                                {data ? (
                                                    <div>
                                                        <SeverityBadge riskCategory={data.risk as any} size="sm" showIcon />
                                                        <p className="text-xs text-gray-500 mt-1">{data.phenotype}</p>
                                                        <p className="text-[10px] text-gray-600 capitalize">{data.drug}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-600">Not analyzed</p>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Summary */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="mt-8 glass rounded-xl p-6">
                            <h3 className="font-space-grotesk font-semibold mb-3 flex items-center gap-2">
                                <ArrowLeftRight className="w-5 h-5 text-[#39FF14]" /> Comparison Summary
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Total Differences</p>
                                    <p className="text-2xl font-bold text-yellow-400">{allGenes.filter(g => {
                                        const l = leftAnalysis.genes.find(x => x.gene === g)
                                        const r = rightAnalysis.genes.find(x => x.gene === g)
                                        return l?.risk !== r?.risk
                                    }).length}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Genes in A only</p>
                                    <p className="text-2xl font-bold text-blue-400">{leftAnalysis.genes.filter(g => !rightAnalysis.genes.find(r => r.gene === g.gene)).length}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Genes in B only</p>
                                    <p className="text-2xl font-bold text-purple-400">{rightAnalysis.genes.filter(g => !leftAnalysis.genes.find(l => l.gene === g.gene)).length}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                        <Columns className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h2 className="font-space-grotesk font-semibold text-xl text-gray-500 mb-2">Select Two Analyses</h2>
                        <p className="text-gray-600 max-w-md mx-auto">Choose analyses from the dropdowns above to compare their pharmacogenomic results side by side.</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
