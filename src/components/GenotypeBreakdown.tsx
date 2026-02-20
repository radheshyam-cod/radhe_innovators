'use client'

import { motion } from 'framer-motion'
import { Dna, Activity, Info } from 'lucide-react'
import { StarAllele } from '@/types'

interface GenotypeBreakdownProps {
  gene: string
  starAlleles: StarAllele[]
  phenotype: string
  activityScore?: number
  confidence: number
  className?: string
}

const GenotypeBreakdown = ({
  gene,
  starAlleles,
  phenotype,
  activityScore,
  confidence,
  className = ''
}: GenotypeBreakdownProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`glass rounded-xl p-6 hover-lift transition-all duration-300 ${className}`}
    >
      {/* Gene Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Dna className="w-8 h-8 text-[#39FF14] mb-2" />
          <div>
            <h3 className="font-space-grotesk font-bold text-xl text-[#D9D9D9]">
              {gene}
            </h3>
            <p className="text-sm text-[#D9D9D9] opacity-80">
              {phenotype}
            </p>
          </div>
        </div>

        {/* Activity Score */}
        {activityScore !== undefined && (
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#D9D9D9]" />
              <div>
                <span className="text-sm text-[#D9D9D9]">Activity Score:</span>
                <span className="text-2xl font-bold cyber-lime">
                  {activityScore.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Star Alleles */}
      <div className="space-y-4">
        <h4 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9] mb-4">
          Star Alleles
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {starAlleles.map((allele, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.1 }}
              className="glass p-4 rounded-lg hover-lift"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-space-grotesk font-bold text-lg text-[#D9D9D9]">
                    {allele.allele}
                  </span>
                  <span className="text-sm text-[#D9D9D9] opacity-80">
                    {allele.zygosity === 'homozygous' ? 'Homozygous' : 'Heterozygous'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-[#D9D9D9]">
                      Position: {allele.position || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-[#D9D9D9]">
                      Confidence: {Math.round(allele.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#D9D9D9]">Overall Confidence</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#39FF14] to-cyan-500 rounded-full"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-[#D9D9D9] ml-2">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 flex items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="inline-flex items-center space-x-2 p-3 bg-blue-500/20 rounded-full"
        >
          <Info className="w-4 h-4 text-white" />
          <span className="text-sm text-white ml-2">
            Click for detailed analysis
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default GenotypeBreakdown
