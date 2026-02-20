'use client'

import { motion } from 'framer-motion'
import { AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon, ShieldIcon } from 'lucide-react'
import { RiskCategory } from '@/types'

interface RiskCardProps {
  gene: string
  riskCategory: RiskCategory[keyof RiskCategory]
  phenotype: string
  recommendations: number
  description: string
  confidence: number
  onClick?: () => void
  className?: string
}

const RiskCard = ({
  gene,
  riskCategory,
  phenotype,
  recommendations,
  description,
  confidence,
  onClick,
  className = ''
}: RiskCardProps) => {
  const getRiskColor = () => {
    switch (riskCategory) {
      case 'safe': return 'risk-safe'
      case 'adjust': return 'risk-adjust'
      case 'toxic': return 'risk-toxic'
      case 'ineffective': return 'risk-ineffective'
      case 'unknown': return 'risk-unknown'
      default: return 'risk-unknown'
    }
  }

  const getRiskIcon = () => {
    switch (riskCategory) {
      case 'safe': return <ShieldIcon className="w-5 h-5" />
      case 'adjust': return <TrendingUpIcon className="w-5 h-5" />
      case 'toxic': return <AlertTriangleIcon className="w-5 h-5" />
      case 'ineffective': return <TrendingDownIcon className="w-5 h-5" />
      case 'unknown': return <ShieldIcon className="w-5 h-5 opacity-50" />
      default: return <ShieldIcon className="w-5 h-5" />
    }
  }

  const getRiskLabel = () => {
    switch (riskCategory) {
      case 'safe': return 'Standard Prescribing'
      case 'adjust': return 'Dosage Adjustment Required'
      case 'toxic': return 'High Risk of Toxicity'
      case 'ineffective': return 'High Risk of Failure'
      case 'unknown': return 'Indeterminate Risk'
      default: return 'Unknown Risk'
    }
  }

  const getSeverityColor = () => {
    switch (riskCategory) {
      case 'safe': return 'text-green-100'
      case 'adjust': return 'text-yellow-100'
      case 'toxic': return 'text-red-100'
      case 'ineffective': return 'text-orange-100'
      case 'unknown': return 'text-gray-100'
      default: return 'text-gray-100'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className={`glass rounded-xl p-6 cursor-pointer hover-lift transition-all duration-300 ${className}`}
    >
      {/* Risk Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getRiskColor()} bg-opacity-20`}>
            {getRiskIcon()}
          </div>
          <div>
            <h3 className="font-space-grotesk font-bold text-lg text-[#D9D9D9]">
              {gene} - {phenotype}
            </h3>
            <p className={`text-sm font-medium mt-1 ${getSeverityColor()}`}>
              {getRiskLabel()}
            </p>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#D9D9D9]">Confidence:</span>
          <div className="flex items-center">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-[#D9D9D9] ml-2">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#D9D9D9] text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Recommendations */}
      {recommendations > 0 && (
        <div className="border-t border-white/20 pt-4">
          <h4 className="font-space-grotesk font-semibold text-[#D9D9D9] mb-3">
            Clinical Recommendations ({recommendations})
          </h4>
          <div className="space-y-2">
            {/* This would be populated with actual recommendation data */}
            <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
              <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-[#D9D9D9]">
                Review detailed recommendations in Dashboard
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onClick}
        className="w-full mt-4 px-6 py-3 bg-[#39FF14] text-black font-semibold rounded-lg hover-lift transition-all duration-200"
      >
        View Detailed Analysis
      </button>
    </motion.div>
  )
}

export default RiskCard
