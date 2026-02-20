'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangleIcon } from 'lucide-react'
import UploadZone from '@/components/UploadZone'
import MultiSelect from '@/components/MultiSelect'
import DetailedResults from '@/components/DetailedResults'
import { ValidationResult } from '@/types'
import { SUPPORTED_DRUGS_FOR_ANALYSIS } from '@/lib/gene-drug-data'

const supportedDrugs = SUPPORTED_DRUGS_FOR_ANALYSIS.map(drug => ({
  value: drug,
  label: drug.charAt(0).toUpperCase() + drug.slice(1),
}))

export default function AnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(['codeine'])

  // Collapse state indexing by drug name
  const [expandedDrugs, setExpandedDrugs] = useState<Record<string, boolean>>({})

  const toggleDrugExpanded = (drugName: string) => {
    setExpandedDrugs(prev => ({ ...prev, [drugName]: !prev[drugName] }))
  }

  const handleFileSelect = (files: File[]) => {
    setIsAnalyzing(true)
    setError(null)
  }

  const handleValidationComplete = (validationResult: ValidationResult) => {
    // Result is stored in window.__lastAnalysisResult by UploadZone
    const result = (window as any).__lastAnalysisResult
    if (result) {
      // Handle both single-drug format (matches image schema) and polypharmacy format
      if (result.drug && !result.results) {
        // Single-drug response format - convert to polypharmacy format for display
        setAnalysisResult({
          results: [result],
          overall_summary: {
            highest_severity: result.risk_assessment?.severity || 'none',
            drugs_flagged: 1,
          },
        })
      } else if (result.results) {
        // Polypharmacy response format
        setAnalysisResult(result)
      } else {
        setAnalysisResult(result)
      }
      setIsAnalyzing(false)

      // Auto-expand all results on load
      const initialExpandState: Record<string, boolean> = {}
      const results = result.results || (result.drug ? [result] : [])
      results.forEach((r: any) => initialExpandState[r.drug] = true)
      setExpandedDrugs(initialExpandState)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsAnalyzing(false)
  }

  // Construct query parameter string for backend
  const buildApiEndpoint = () => {
    const params = new URLSearchParams()
    selectedDrugs.forEach(d => params.append('drugs', d))
    return `/api/cds/analyze?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-space-grotesk font-bold text-4xl sm:text-3xl lg:text-5xl text-[#D9D9D9]">
              Polypharmacy Analysis
            </h1>
            <p className="text-xl text-[#D9D9D9] opacity-80 mt-2">
              Comprehensive clinical multi-drug assessment based on your genetic profile
            </p>
          </div>
        </div>

        {/* Drug Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#D9D9D9] mb-2">
            Select Drugs for Combination Analysis
          </label>
          <MultiSelect
            options={supportedDrugs}
            selectedValues={selectedDrugs}
            onChange={setSelectedDrugs}
            placeholder="Select drugs (e.g., Warfarin, Codeine)..."
          />
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          {selectedDrugs.length === 0 ? (
            <div className="w-full max-w-2xl mx-auto p-6 bg-red-900/20 border border-red-500 rounded-xl text-center">
              <AlertTriangleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-100 font-semibold">Please select at least one drug above to enable VCF upload.</p>
            </div>
          ) : (
            <UploadZone
              onValidationComplete={handleValidationComplete}
              onUploadProgress={() => { }}
              onFileSelect={handleFileSelect}
              onError={handleError}
              apiEndpoint={buildApiEndpoint()}
            />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-900/20 border border-red-500 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <AlertTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-100 mb-1">Analysis Failed</h3>
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Polypharmacy Summary Section */}
        {analysisResult && analysisResult.overall_summary && !error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass rounded-xl p-6 border-l-4"
            style={{
              borderLeftColor:
                analysisResult.overall_summary.highest_severity === 'critical' ? '#EF4444' :
                  analysisResult.overall_summary.highest_severity === 'high' ? '#F97316' :
                    '#39FF14'
            }}
          >
            <h2 className="font-space-grotesk font-bold text-2xl mb-2 flex justify-between">
              <span>Polypharmacy Summary Tracker</span>
              <span className="text-sm font-normal text-gray-400 mt-2">{analysisResult.overall_summary.drugs_flagged} drug(s) flagged for risk</span>
            </h2>
            <p className="text-gray-300">
              Highest system severity detected across all combinations:
              <span className="ml-2 px-2 py-1 bg-black/50 rounded font-semibold uppercase">{analysisResult.overall_summary.highest_severity}</span>
            </p>
          </motion.div>
        )}

        {/* Map Over Polypharmacy Drug Array Results */}
        {analysisResult && analysisResult.results && !error && (
          <DetailedResults
            analysisResult={analysisResult}
            expandedDrugs={expandedDrugs}
            toggleDrugExpanded={toggleDrugExpanded}
          />
        )}
      </div>
    </div>
  )
}
