'use client'

import { motion } from 'framer-motion'
import { ExternalLinkIcon, BookOpenIcon, CheckCircleIcon, AlertTriangleIcon } from 'lucide-react'
import { CPICGuideline } from '@/types'

interface CPICReferencePanelProps {
  gene: string
  drug: string
  guidelines: CPICGuideline[]
  className?: string
}

const CPICReferencePanel = ({
  gene,
  drug,
  guidelines,
  className = ''
}: CPICReferencePanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`glass rounded-xl p-6 hover-lift transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpenIcon className="w-6 h-6 text-[#39FF14] mb-2" />
          <div>
            <h3 className="font-space-grotesk font-bold text-xl text-[#D9D9D9]">
              CPIC Guidelines
            </h3>
            <p className="text-sm text-[#D9D9D9] opacity-80">
              {gene} - {drug} interactions
            </p>
          </div>
        </div>

        <div className="text-right">
          <button className="p-2 glass rounded-lg hover-lift">
            <ExternalLinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guidelines List */}
      <div className="space-y-4">
        {guidelines.map((guideline, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.1 }}
            className="glass p-4 rounded-lg hover-lift"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${guideline.level === 'A' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                  <span className="text-white font-bold text-sm">
                    {guideline.level}
                  </span>
                </div>
                <div>
                  <h4 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9] mb-2">
                    {guideline.drug}
                  </h4>
                  <p className="text-sm text-[#D9D9D9] opacity-80">
                    {guideline.recommendation_text}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
              <div>
                <h4 className="font-medium text-[#D9D9D9] mb-1">
                  Evidence Level {guideline.level}
                </h4>
                <p className="text-sm text-[#D9D9D9] opacity-80">
                  {guideline.evidence_summary}
                </p>
              </div>
            </div>

            <div className="text-right">
              <button className="p-2 glass rounded hover-lift">
                <ExternalLinkIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#D9D9D9]">
            Guidelines updated: {guidelines[0]?.last_updated}
          </span>
          <div className="flex items-center space-x-2">
            <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-[#D9D9D9]">
              Always verify latest CPIC guidelines
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CPICReferencePanel
