'use client'

import { motion } from 'framer-motion'
import { CheckCircleIcon, AlertTriangleIcon } from 'lucide-react'
import { UploadProgress } from '@/types'

interface ProcessingProgressBarProps {
  progress: UploadProgress
  showPercentage?: boolean
  showStage?: boolean
  className?: string
}

const ProcessingProgressBar = ({ 
  progress, 
  showPercentage = true, 
  showStage = true,
  className = ''
}: ProcessingProgressBarProps) => {
  const getStageIcon = () => {
    switch (progress.stage) {
      case 'uploading': return <CheckCircleIcon className="w-5 h-5" />
      case 'validating': return <CheckCircleIcon className="w-5 h-5" />
      case 'processing': return <CheckCircleIcon className="w-5 h-5" />
      case 'analyzing': return <CheckCircleIcon className="w-5 h-5" />
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      default: return <AlertTriangleIcon className="w-5 h-5" />
    }
  }

  const getStageColor = () => {
    switch (progress.stage) {
      case 'uploading': return 'text-blue-400'
      case 'validating': return 'text-yellow-400'
      case 'processing': return 'text-blue-400'
      case 'analyzing': return 'text-purple-400'
      case 'completed': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showStage && (
          <div className="flex items-center space-x-2">
            {getStageIcon()}
            <span className={`text-sm font-medium ${getStageColor()}`}>
              {progress.message}
            </span>
          </div>
        )}
        
        {showPercentage && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#D9D9D9]">
              {Math.round(progress.progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[#39FF14] to-cyan-500 rounded-full"
        />
      </div>

      {/* Error State */}
      {progress.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
        >
          <div className="glass p-6 rounded-lg max-w-md mx-4">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-space-grotesk font-semibold text-red-100 mb-2">
              Processing Error
            </h3>
            <p className="text-red-100 text-sm">
              {progress.error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover-lift"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ProcessingProgressBar
