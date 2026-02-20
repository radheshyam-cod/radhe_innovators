'use client'

import { motion } from 'framer-motion'
import { AlertTriangleIcon, ShieldCheckIcon, TrendingUpIcon, TrendingDownIcon, HelpCircleIcon } from 'lucide-react'
import { RiskCategory } from '@/types'

interface SeverityBadgeProps {
  riskCategory: RiskCategory[keyof RiskCategory]
  severity?: 'low' | 'medium' | 'high' | 'critical'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const SeverityBadge = ({ 
  riskCategory, 
  severity, 
  size = 'md', 
  showIcon = true,
  className = ''
}: SeverityBadgeProps) => {
  const getRiskConfig = () => {
    const normalized = typeof riskCategory === 'string' ? riskCategory.toLowerCase().replace(/\s+/g, '_') : ''
    const key = normalized === 'adjust_dosage' ? 'adjust' : normalized
    switch (key) {
      case 'safe':
        return {
          color: 'bg-green-500/20 text-green-100 border-green-500/50',
          icon: ShieldCheckIcon,
          label: 'Safe',
          glow: 'shadow-green-500/20'
        }
      case 'adjust':
        return {
          color: 'bg-yellow-500/20 text-yellow-100 border-yellow-500/50',
          icon: TrendingUpIcon,
          label: key === 'adjust' && normalized === 'adjust_dosage' ? 'Adjust Dosage' : 'Adjust',
          glow: 'shadow-yellow-500/20'
        }
      case 'toxic':
        return {
          color: 'bg-red-500/20 text-red-100 border-red-500/50',
          icon: AlertTriangleIcon,
          label: 'Toxic',
          glow: 'shadow-red-500/20'
        }
      case 'ineffective':
        return {
          color: 'bg-orange-500/20 text-orange-100 border-orange-500/50',
          icon: TrendingDownIcon,
          label: 'Ineffective',
          glow: 'shadow-orange-500/20'
        }
      case 'unknown':
        return {
          color: 'bg-gray-500/20 text-gray-100 border-gray-500/50',
          icon: HelpCircleIcon,
          label: 'Unknown',
          glow: 'shadow-gray-500/20'
        }
      default:
        return {
          color: 'bg-gray-500/20 text-gray-100 border-gray-500/50',
          icon: HelpCircleIcon,
          label: 'Unknown',
          glow: 'shadow-gray-500/20'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs font-medium'
      case 'md':
        return 'px-3 py-1.5 text-sm font-medium'
      case 'lg':
        return 'px-4 py-2 text-base font-medium'
      default:
        return 'px-3 py-1.5 text-sm font-medium'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3'
      case 'md': return 'w-4 h-4'
      case 'lg': return 'w-5 h-5'
      default: return 'w-4 h-4'
    }
  }

  const config = getRiskConfig()
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`inline-flex items-center space-x-2 rounded-full border ${config.color} ${getSizeClasses()} ${config.glow} ${className}`}
    >
      {showIcon && (
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Icon className={getIconSize()} />
        </motion.div>
      )}
      <span className="font-space-grotesk font-semibold">
        {config.label}
      </span>
      
      {/* Severity indicator if provided */}
      {severity && (
        <div className="flex items-center space-x-1 ml-2">
          <div className="w-1 h-1 rounded-full bg-current opacity-50" />
          <span className="text-xs opacity-75">{severity}</span>
        </div>
      )}
    </motion.div>
  )
}

export default SeverityBadge
