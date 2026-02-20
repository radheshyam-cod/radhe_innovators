'use client'

import { motion } from 'framer-motion'
import { Info, Shield, Users, Building2, Dna, Award, Heart, Lock, FileText, Scale } from 'lucide-react'

const team = [
    { name: 'Dr. Sarah Chen', role: 'Chief Medical Officer', specialty: 'Clinical Pharmacogenomics' },
    { name: 'Alex Kumar', role: 'Lead Engineer', specialty: 'AI/ML & Bioinformatics' },
    { name: 'Dr. Maria Rodriguez', role: 'Clinical Advisor', specialty: 'Precision Medicine' },
    { name: 'James Park', role: 'Security Lead', specialty: 'HIPAA Compliance' },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-[#D9D9D9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#39FF14]/20 to-blue-500/10 border border-[#39FF14]/20 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-[#39FF14]" />
                    </div>
                    <h1 className="font-space-grotesk font-bold text-5xl lg:text-6xl mb-4">About <span className="cyber-lime">GeneDose</span>.ai</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">Advancing precision medicine through pharmacogenomic clinical decision support</p>
                </motion.div>

                {/* Mission */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-8 mb-8">
                    <h2 className="font-space-grotesk font-bold text-2xl mb-4 flex items-center gap-3">
                        <Heart className="w-6 h-6 text-red-400" /> Our Mission
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-lg">
                        GeneDose.ai was built to bridge the gap between genomic data and clinical action. We believe every patient deserves medication therapy tailored to their genetic makeup. Our platform transforms complex VCF files into clear, actionable dosing recommendations — reducing adverse drug reactions by up to 90% and making precision medicine accessible to every clinician.
                    </p>
                </motion.div>

                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: Dna, title: 'CPIC Evidence-Based', desc: 'Level A & B recommendations from clinical pharmacogenetics guidelines', color: 'text-[#39FF14]' },
                        { icon: Award, title: '>96% Concordance', desc: 'Validated against gold-standard pharmacogenomic datasets', color: 'text-yellow-400' },
                        { icon: Lock, title: 'HIPAA Compliant', desc: 'Enterprise-grade encryption with zero-retention genomic data policy', color: 'text-blue-400' },
                    ].map((f, i) => (
                        <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                            className="glass rounded-xl p-6 text-center">
                            <f.icon className={`w-8 h-8 ${f.color} mx-auto mb-3`} />
                            <h3 className="font-space-grotesk font-bold text-lg mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Team */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
                    <h2 className="font-space-grotesk font-bold text-2xl mb-6 flex items-center gap-3"><Users className="w-6 h-6 text-purple-400" /> Our Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {team.map(m => (
                            <div key={m.name} className="glass rounded-xl p-5 text-center">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#39FF14]/20 to-purple-500/10 border border-white/10 flex items-center justify-center mx-auto mb-3">
                                    <span className="text-lg font-bold text-[#39FF14]">{m.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                <h3 className="font-semibold">{m.name}</h3>
                                <p className="text-sm text-[#39FF14]">{m.role}</p>
                                <p className="text-xs text-gray-500 mt-1">{m.specialty}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Legal Sections */}
                <div id="hipaa" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
                    {[
                        { id: 'privacy', icon: Lock, title: 'Privacy Policy', content: 'We never sell or share your data. Genomic data is processed in-memory with zero permanent storage. Session data is encrypted using AES-256. We comply with GDPR and CCPA requirements for data subject rights.' },
                        { id: 'terms', icon: FileText, title: 'Terms of Service', content: 'GeneDose.ai is provided as a clinical decision support tool for qualified healthcare professionals. Use of this platform constitutes acceptance of our terms. The platform is not a substitute for professional medical judgment.' },
                        { id: 'disclaimer', icon: Scale, title: 'Clinical Disclaimer', content: 'GeneDose.ai is an AI-powered decision support tool intended to assist, not replace, clinical judgment. All recommendations should be verified against current CPIC guidelines and validated with laboratory confirmation before making prescribing decisions.' },
                    ].map((sec, i) => (
                        <div key={sec.id} id={sec.id} className="glass rounded-xl p-6">
                            <h2 className="font-space-grotesk font-bold text-xl mb-3 flex items-center gap-2">
                                <sec.icon className="w-5 h-5 text-gray-400" /> {sec.title}
                            </h2>
                            <p className="text-sm text-gray-400 leading-relaxed">{sec.content}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
