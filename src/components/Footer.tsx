'use client'

import Link from 'next/link'
import { Shield, Github, Twitter, Mail, Heart } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const links = {
        product: [
            { label: 'Analysis', href: '/analysis' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Encyclopedia', href: '/encyclopedia' },
            { label: 'Drug Checker', href: '/drug-check' },
        ],
        resources: [
            { label: 'Help & FAQ', href: '/help' },
            { label: 'About Us', href: '/about' },
            { label: 'CPIC Guidelines', href: 'https://cpicpgx.org', external: true },
            { label: 'PharmGKB', href: 'https://www.pharmgkb.org', external: true },
        ],
        legal: [
            { label: 'Privacy Policy', href: '/about#privacy' },
            { label: 'Terms of Service', href: '/about#terms' },
            { label: 'HIPAA Compliance', href: '/about#hipaa' },
            { label: 'Disclaimer', href: '/about#disclaimer' },
        ],
    }

    return (
        <footer className="relative border-t border-white/10 bg-black/80 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#39FF14] to-[#32d912] rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-lg font-bold text-[#D9D9D9] font-space-grotesk">GeneDose.ai</span>
                        </Link>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                            Precision medicine platform for pharmacogenomic analysis, powered by CPIC guidelines and AI.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#39FF14]/30 transition-colors">
                                <Github className="w-4 h-4 text-gray-400" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#39FF14]/30 transition-colors">
                                <Twitter className="w-4 h-4 text-gray-400" />
                            </a>
                            <a href="mailto:support@genedose.ai" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#39FF14]/30 transition-colors">
                                <Mail className="w-4 h-4 text-gray-400" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-space-grotesk font-semibold text-[#D9D9D9] mb-4">Product</h3>
                        <ul className="space-y-2.5">
                            {links.product.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-gray-500 hover:text-[#39FF14] transition-colors">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-space-grotesk font-semibold text-[#D9D9D9] mb-4">Resources</h3>
                        <ul className="space-y-2.5">
                            {links.resources.map(l => (
                                <li key={l.href}>
                                    {(l as any).external ? (
                                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#39FF14] transition-colors">{l.label} ↗</a>
                                    ) : (
                                        <Link href={l.href} className="text-sm text-gray-500 hover:text-[#39FF14] transition-colors">{l.label}</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-space-grotesk font-semibold text-[#D9D9D9] mb-4">Legal</h3>
                        <ul className="space-y-2.5">
                            {links.legal.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-gray-500 hover:text-[#39FF14] transition-colors">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-600">
                        © {currentYear} GeneDose.ai — All rights reserved. For research and clinical decision support only.
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                        Made with <Heart className="w-3 h-3 text-red-500" /> for precision medicine
                    </p>
                </div>
            </div>
        </footer>
    )
}
