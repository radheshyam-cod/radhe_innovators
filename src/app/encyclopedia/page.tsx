'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, BookOpen, Search, ChevronDown, ChevronUp, Pill } from 'lucide-react'
import { GENE_DRUG_PAIRS, getGenesForDrug, getDrugsForGene } from '@/lib/gene-drug-data'

const GENE_INFO: Record<string, { fullName: string; chromosome: string; fn: string }> = {
    CYP2D6: { fullName: 'Cytochrome P450 2D6', chromosome: '22q13.2', fn: 'Metabolizes ~25% of drugs including opioids and antidepressants.' },
    CYP2C19: { fullName: 'Cytochrome P450 2C19', chromosome: '10q23.33', fn: 'Metabolizes PPIs, antiplatelet agents, and antidepressants.' },
    CYP2C9: { fullName: 'Cytochrome P450 2C9', chromosome: '10q23.33', fn: 'Major enzyme for warfarin, phenytoin, and NSAIDs.' },
    SLCO1B1: { fullName: 'Solute Carrier Organic Anion Transporter 1B1', chromosome: '12p12.1', fn: 'Hepatic uptake transporter for statins.' },
    TPMT: { fullName: 'Thiopurine S-Methyltransferase', chromosome: '6p22.3', fn: 'Metabolizes thiopurine drugs.' },
    DPYD: { fullName: 'Dihydropyrimidine Dehydrogenase', chromosome: '1p21.3', fn: 'Rate-limiting enzyme in fluoropyrimidine catabolism.' },
    'HLA-B': { fullName: 'Human Leukocyte Antigen B', chromosome: '6p21.33', fn: 'Key role in immune-mediated adverse drug reactions.' },
    'HLA-A': { fullName: 'Human Leukocyte Antigen A', chromosome: '6p22.1', fn: 'MHC class I gene in drug hypersensitivity.' },
    UGT1A1: { fullName: 'UDP Glucuronosyltransferase 1A1', chromosome: '2q37.1', fn: 'Conjugates bilirubin and irinotecan.' },
    NUDT15: { fullName: 'Nudix Hydrolase 15', chromosome: '13q14.2', fn: 'Hydrolyzes thiopurine metabolites.' },
    CYP3A5: { fullName: 'Cytochrome P450 3A5', chromosome: '7q22.1', fn: 'Metabolizes tacrolimus.' },
    G6PD: { fullName: 'Glucose-6-Phosphate Dehydrogenase', chromosome: 'Xq28', fn: 'Protects RBCs from oxidative damage.' },
}

export default function EncyclopediaPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'genes' | 'drugs'>('genes')
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    const allGenes = useMemo(() => [...new Set(GENE_DRUG_PAIRS.map(p => p.gene))].sort(), [])
    const allDrugs = useMemo(() => [...new Set(GENE_DRUG_PAIRS.map(p => p.drug))].sort(), [])

    const filteredGenes = allGenes.filter(g =>
        g.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (GENE_INFO[g]?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()))
    const filteredDrugs = allDrugs.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()))

    const toggle = (item: string) => setExpandedItem(expandedItem === item ? null : item)

    return (
        <div className="min-h-screen bg-black text-[#D9D9D9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                        </div>
                        <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Gene & Drug Encyclopedia</h1>
                    </div>
                    <p className="text-lg text-gray-400 mt-2">Comprehensive pharmacogenomic reference</p>
                </motion.div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search genes or drugs..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#D9D9D9] placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50" />
                </div>

                <div className="flex gap-2 mb-8">
                    {([['genes', Dna, filteredGenes.length], ['drugs', Pill, filteredDrugs.length]] as const).map(([id, Icon, count]) => (
                        <button key={id} onClick={() => setActiveTab(id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === id ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                            <Icon className="w-4 h-4" />{id.charAt(0).toUpperCase() + id.slice(1)}
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/10">{count}</span>
                        </button>
                    ))}
                </div>

                {activeTab === 'genes' && (
                    <div className="space-y-3">
                        {filteredGenes.map((gene, i) => {
                            const info = GENE_INFO[gene]; const drugs = getDrugsForGene(gene); const open = expandedItem === gene
                            return (
                                <motion.div key={gene} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass rounded-xl overflow-hidden">
                                    <button onClick={() => toggle(gene)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Dna className="w-5 h-5 text-[#39FF14]" />
                                            <div className="text-left">
                                                <h3 className="font-space-grotesk font-bold text-lg">{gene}</h3>
                                                {info && <p className="text-xs text-gray-500">{info.fullName}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500">{drugs.length} drugs</span>
                                            {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {open && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 px-5 pb-5">
                                                <div className="pt-4 space-y-4">
                                                    {info && (
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                            <div className="p-3 bg-white/5 rounded-lg"><p className="text-xs text-gray-500 mb-1">Chromosome</p><p className="font-mono text-[#39FF14]">{info.chromosome}</p></div>
                                                            <div className="col-span-2 p-3 bg-white/5 rounded-lg"><p className="text-xs text-gray-500 mb-1">Function</p><p className="text-gray-300">{info.fn}</p></div>
                                                        </div>
                                                    )}
                                                    <div><p className="text-xs text-gray-500 mb-2">Associated Drugs</p>
                                                        <div className="flex flex-wrap gap-2">{drugs.map(d => <span key={d} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 capitalize">{d}</span>)}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'drugs' && (
                    <div className="space-y-3">
                        {filteredDrugs.map((drug, i) => {
                            const genes = getGenesForDrug(drug); const open = expandedItem === drug
                            return (
                                <motion.div key={drug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass rounded-xl overflow-hidden">
                                    <button onClick={() => toggle(drug)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors">
                                        <div className="flex items-center gap-3"><Pill className="w-5 h-5 text-orange-400" /><h3 className="font-space-grotesk font-bold text-lg capitalize">{drug}</h3></div>
                                        <div className="flex items-center gap-3"><span className="text-xs text-gray-500">{genes.length} genes</span>{open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</div>
                                    </button>
                                    <AnimatePresence>
                                        {open && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 px-5 pb-5">
                                                <div className="pt-4"><p className="text-xs text-gray-500 mb-2">Metabolized By</p>
                                                    <div className="space-y-2">{genes.map(gene => (
                                                        <div key={gene} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                            <Dna className="w-4 h-4 text-[#39FF14]" />
                                                            <div><span className="font-mono text-sm font-semibold">{gene}</span>{GENE_INFO[gene] && <p className="text-xs text-gray-500">{GENE_INFO[gene].fullName}</p>}</div>
                                                        </div>
                                                    ))}</div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
