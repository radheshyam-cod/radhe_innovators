'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, BookOpen, MessageCircle, ChevronDown, ChevronUp, Search, GraduationCap, Mail } from 'lucide-react'

const FAQS = [
    {
        category: 'Getting Started', items: [
            { q: 'What is GeneDose.ai?', a: 'GeneDose.ai is a clinical decision support platform that analyzes VCF (Variant Call Format) files to provide pharmacogenomic insights, helping clinicians make safer prescribing decisions based on a patient\'s genetic profile.' },
            { q: 'How do I run an analysis?', a: 'Navigate to the Analysis page, select the drugs you want to check, upload a VCF file, and the system will process it to generate risk assessments and clinical recommendations.' },
            { q: 'What file formats are supported?', a: 'Currently, we support VCF (Variant Call Format) files, which are the standard output from genome sequencing pipelines.' },
        ]
    },
    {
        category: 'Understanding Results', items: [
            { q: 'What do the risk categories mean?', a: 'Safe = standard prescribing OK. Adjust = dosage modification recommended. Toxic = high toxicity risk, avoid or significantly reduce dose. Ineffective = poor therapeutic response expected, consider alternatives.' },
            { q: 'What are metabolizer phenotypes?', a: 'Metabolizer phenotypes describe how effectively a patient processes drugs: Poor (slow), Intermediate (reduced), Normal (typical), Rapid (fast), and Ultrarapid (very fast). These affect drug efficacy and toxicity.' },
            { q: 'How reliable are the results?', a: 'Our analysis achieves >96% concordance with gold-standard pharmacogenomic datasets and follows CPIC Level A & B evidence-based guidelines.' },
        ]
    },
    {
        category: 'Genes & Drugs', items: [
            { q: 'Which genes are analyzed?', a: 'We analyze 6 critical pharmacogenes: CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, and DPYD, plus additional genes like HLA-B, UGT1A1, and G6PD.' },
            { q: 'What are CPIC guidelines?', a: 'CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines provide peer-reviewed, evidence-based recommendations for drug dosing based on genetic test results.' },
        ]
    },
    {
        category: 'Security & Privacy', items: [
            { q: 'Is my genomic data secure?', a: 'Yes. All data is encrypted in transit (TLS) and at rest. We follow a zero-retention policy — genomic data is processed in memory and never stored permanently.' },
            { q: 'Is GeneDose.ai HIPAA compliant?', a: 'Yes. We implement enterprise-grade security controls compliant with HIPAA requirements for protecting health information.' },
        ]
    },
]

const GLOSSARY = [
    { term: 'VCF', definition: 'Variant Call Format — standard file format for storing gene sequence variations.' },
    { term: 'Pharmacogenomics', definition: 'Study of how genes affect a person\'s response to drugs.' },
    { term: 'Star Alleles', definition: 'Named haplotype variants (e.g., *1, *2) that define functional categories of gene variants.' },
    { term: 'Diplotype', definition: 'The combination of two star alleles a person carries for a gene.' },
    { term: 'Phenotype', definition: 'The observable metabolizer status derived from a diplotype.' },
    { term: 'CPIC', definition: 'Clinical Pharmacogenetics Implementation Consortium.' },
    { term: 'ADR', definition: 'Adverse Drug Reaction — harmful, unintended reaction to a medication.' },
]

export default function HelpPage() {
    const [openFAQ, setOpenFAQ] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'faq' | 'glossary'>('faq')

    const filteredFAQs = FAQS.map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.q.toLowerCase().includes(searchQuery.toLowerCase()) || i.a.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0)

    const filteredGlossary = GLOSSARY.filter(g => g.term.toLowerCase().includes(searchQuery.toLowerCase()) || g.definition.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="min-h-screen bg-black text-[#D9D9D9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Help & FAQ</h1>
                    </div>
                    <p className="text-lg text-gray-400 mt-2">Everything you need to know about GeneDose.ai</p>
                </motion.div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search help articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#D9D9D9] placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50" />
                </div>

                <div className="flex gap-2 mb-8">
                    {[
                        { id: 'faq' as const, label: 'FAQ', icon: MessageCircle },
                        { id: 'glossary' as const, label: 'Glossary', icon: GraduationCap },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === tab.id ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'faq' && (
                    <div className="space-y-8">
                        {filteredFAQs.map((cat, ci) => (
                            <motion.div key={cat.category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
                                <h2 className="font-space-grotesk font-semibold text-xl mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-[#39FF14]" />{cat.category}
                                </h2>
                                <div className="space-y-2">
                                    {cat.items.map(item => {
                                        const isOpen = openFAQ === item.q
                                        return (
                                            <div key={item.q} className="glass rounded-xl overflow-hidden">
                                                <button onClick={() => setOpenFAQ(isOpen ? null : item.q)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors text-left">
                                                    <span className="font-medium pr-4">{item.q}</span>
                                                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10">
                                                            <p className="px-4 py-4 text-sm text-gray-400 leading-relaxed">{item.a}</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'glossary' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-white/10">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Term</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Definition</th>
                            </tr></thead>
                            <tbody>
                                {filteredGlossary.map(g => (
                                    <tr key={g.term} className="border-b border-white/5 hover:bg-white/[0.03]">
                                        <td className="px-6 py-3 font-mono text-sm font-semibold text-[#39FF14]">{g.term}</td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{g.definition}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* Contact */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mt-12 glass rounded-xl p-6 text-center">
                    <Mail className="w-8 h-8 text-[#39FF14] mx-auto mb-3" />
                    <h3 className="font-space-grotesk font-semibold text-lg mb-1">Still need help?</h3>
                    <p className="text-sm text-gray-500 mb-4">Contact our support team</p>
                    <a href="mailto:support@genedose.ai" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#39FF14] text-black font-semibold rounded-xl hover:bg-[#32d912] transition-colors">
                        <Mail className="w-4 h-4" /> Email Support
                    </a>
                </motion.div>
            </div>
        </div>
    )
}
