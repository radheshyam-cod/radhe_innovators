'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  ZapIcon,
  BarChart3Icon,
  UsersIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  TrendingUpIcon
} from 'lucide-react'
import Link from 'next/link'
import UploadZone from '@/components/UploadZone'
import RiskCard from '@/components/RiskCard'
import SeverityBadge from '@/components/SeverityBadge'

const Homepage = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with encrypted data handling and zero-retention policy for genomic data'
    },
    {
      icon: ZapIcon,
      title: '60-Second Analysis',
      description: 'Rapid processing with >96% concordance to gold-standard pharmacogenomic datasets'
    },
    {
      icon: BarChart3Icon,
      title: 'CPIC Guidelines',
      description: 'Evidence-based Level A & B recommendations from Clinical Pharmacogenetics Implementation Consortium'
    },
    {
      icon: UsersIcon,
      title: 'Multi-Role Support',
      description: 'Tailored interfaces for clinicians, pharmacists, researchers, and patients'
    }
  ]

  const riskCategories = [
    {
      category: 'safe',
      title: 'Standard Prescribing',
      description: 'No genetic risk factors detected',
      percentage: 45
    },
    {
      category: 'adjust',
      title: 'Dosage Adjustment',
      description: 'Modified dosing recommended',
      percentage: 30
    },
    {
      category: 'toxic',
      title: 'High Toxicity Risk',
      description: 'Avoid or significantly reduce dose',
      percentage: 15
    },
    {
      category: 'ineffective',
      title: 'Therapeutic Failure',
      description: 'Alternative therapy recommended',
      percentage: 10
    }
  ]

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#4C5578] to-black opacity-50"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div className="absolute inset-0">
          {mounted && [...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#39FF14] rounded-full opacity-20"
              style={{
                left: `${((i * 7 + 13) % 100)}%`,
                top: `${((i * 11 + 29) % 100)}%`,
                animation: `pulse ${2 + (i % 5) * 0.6}s infinite`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="font-space-grotesk font-bold text-6xl sm:text-7xl lg:text-8xl mb-6">
              <span className="text-[#D9D9D9]">Gene</span>
              <span className="cyber-lime">Dose</span>
              <span className="text-[#D9D9D9]">.ai</span>
            </h1>

            <p className="text-xl sm:text-2xl lg:text-3xl font-light text-[#D9D9D9] mb-8 max-w-4xl mx-auto">
              Clinical Decision Support for Pharmacogenomics
            </p>

            <p className="text-lg text-[#D9D9D9] opacity-80 mb-12 max-w-3xl mx-auto">
              Transform VCF files into actionable clinical recommendations.
              Reduce adverse drug reactions by 90% with precision medicine powered by CPIC guidelines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/analysis">
                <button className="px-8 py-4 bg-[#39FF14] text-black font-space-grotesk font-bold rounded-lg hover-lift text-lg">
                  Start Analysis
                  <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                </button>
              </Link>

              <Link href="/dashboard">
                <button className="px-8 py-4 glass text-[#D9D9D9] font-space-grotesk font-bold rounded-lg hover-lift text-lg">
                  View Demo
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-space-grotesk font-bold text-4xl sm:text-5xl mb-4">
              Why Choose GeneDose.ai?
            </h2>
            <p className="text-xl text-[#D9D9D9] opacity-80 max-w-3xl mx-auto">
              Built for clinicians, designed for precision, powered by evidence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 hover-lift"
              >
                <feature.icon className="w-12 h-12 text-[#39FF14] mb-4" />
                <h3 className="font-space-grotesk font-bold text-xl mb-3 text-[#D9D9D9]">
                  {feature.title}
                </h3>
                <p className="text-[#D9D9D9] opacity-80">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Categories Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-space-grotesk font-bold text-4xl sm:text-5xl mb-4">
              Risk Assessment Categories
            </h2>
            <p className="text-xl text-[#D9D9D9] opacity-80 max-w-3xl mx-auto">
              Clear, actionable categorization based on CPIC guidelines
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {riskCategories.map((risk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-4">
                  <SeverityBadge
                    riskCategory={risk.category as any}
                    size="lg"
                    showIcon={true}
                  />
                </div>
                <h3 className="font-space-grotesk font-bold text-xl mb-2 text-[#D9D9D9]">
                  {risk.title}
                </h3>
                <p className="text-[#D9D9D9] opacity-80 mb-4">
                  {risk.description}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#39FF14] to-cyan-500 rounded-full"
                    style={{ width: `${risk.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-[#D9D9D9] opacity-60 mt-2">
                  {risk.percentage}% of cases
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-space-grotesk font-bold text-4xl sm:text-5xl mb-4">
              Ready to Analyze?
            </h2>
            <p className="text-xl text-[#D9D9D9] opacity-80">
              Upload your VCF file and get instant pharmacogenomic insights
            </p>
          </motion.div>

          <UploadZone
            onValidationComplete={() => { }}
            onUploadProgress={() => { }}
            onFileSelect={() => { }}
            onError={(error) => {
              console.error('Upload error:', error)
              alert(`Upload failed: ${error}`)
            }}
            apiEndpoint="/api/cds/analyze?drugs=codeine"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl font-space-grotesk font-bold cyber-lime mb-4">
                100,000+
              </div>
              <p className="text-xl text-[#D9D9D9]">
                Lives Saved Annually
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl font-space-grotesk font-bold cyber-lime mb-4">
                96%
              </div>
              <p className="text-xl text-[#D9D9D9]">
                Concordance Rate
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl font-space-grotesk font-bold cyber-lime mb-4">
                &lt;60s
              </div>
              <p className="text-xl text-[#D9D9D9]">
                Processing Time
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Homepage
