'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { UploadCloudIcon, FileTextIcon, CheckCircleIcon, AlertTriangleIcon } from 'lucide-react'
import { ValidationResult, UploadProgress } from '@/types'

interface UploadZoneProps {
  onValidationComplete: (result: ValidationResult) => void
  onUploadProgress: (progress: UploadProgress) => void
  onFileSelect: (files: File[]) => void
  onError: (error: string) => void
  maxFileSize?: number
  className?: string
  apiEndpoint?: string
}

const UploadZone = ({
  onValidationComplete,
  onUploadProgress,
  onFileSelect,
  onError,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  className = '',
  apiEndpoint = '/api/cds/analyze'
}: UploadZoneProps) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsDragOver(false)
    setValidationError(null)

    const file = acceptedFiles[0]
    if (!file) return

    // Validate file size
    if (file.size > maxFileSize) {
      const error = `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`
      setValidationError(error)
      onError(error)
      return
    }

    // Validate file type
    const validTypes = ['.vcf', '.vcf.gz']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(fileExtension)) {
      const error = 'Please upload a VCF file (.vcf or .vcf.gz)'
      setValidationError(error)
      onError(error)
      return
    }

    onFileSelect([file])

    // Real API upload (no mocks)
    await uploadToBackend(file)
  }, [onFileSelect, onError, maxFileSize, apiEndpoint])

  const uploadToBackend = async (file: File) => {
    setIsUploading(true)
    setUploadProgress({ stage: 'uploading', progress: 0, message: 'Uploading file...' })

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Pass drug(s) from URL query into FormData so backend receives them
      // Backend expects drugs as comma-separated string, not multiple form fields
      const url = new URL(apiEndpoint, window.location.origin)
      const drugParam = url.searchParams.get('drug')
      const drugsParams = url.searchParams.getAll('drugs')

      // Combine all drugs into a single comma-separated string
      const allDrugs: string[] = []
      if (drugParam) {
        allDrugs.push(drugParam)
      }
      drugsParams.forEach((d) => {
        if (!allDrugs.includes(d)) {
          allDrugs.push(d)
        }
      })

      if (allDrugs.length > 0) {
        formData.append('drugs', allDrugs.join(','))
      }

      setUploadProgress({ stage: 'validating', progress: 25, message: 'Validating file format and headers...' })

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
      })

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            // Handle both string and array error details
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((e: any) => e.msg || e).join('; ')
            } else if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            } else {
              errorMessage = JSON.stringify(errorData.detail)
            }
          }
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      setUploadProgress({ stage: 'processing', progress: 50, message: 'Processing genomic data...' })
      setUploadProgress({ stage: 'analyzing', progress: 75, message: 'Analyzing variants and calling star alleles...' })

      const result = await response.json()

      setUploadProgress({ stage: 'completed', progress: 100, message: 'Analysis complete!' })

      // Handle both single-drug format (matches image schema) and polypharmacy format
      let qualityMetrics, variantCount
      if (result.drug && !result.results) {
        // Single-drug response format (matches image schema)
        qualityMetrics = result.quality_metrics
        variantCount = result.pharmacogenomic_profile?.detected_variants?.length ?? 0
      } else {
        // Polypharmacy response format
        const firstResult = result.results?.[0]
        qualityMetrics = firstResult?.quality_metrics ?? result.quality_metrics
        variantCount = result.results?.reduce(
          (n: number, r: { pharmacogenomic_profile?: { detected_variants?: unknown[] } }) =>
            n + (r.pharmacogenomic_profile?.detected_variants?.length ?? 0),
          0
        ) ?? firstResult?.pharmacogenomic_profile?.detected_variants?.length ?? 0
      }
      const validationResult: ValidationResult = {
        is_valid: qualityMetrics?.vcf_parsing_success ?? result.quality_metrics?.vcf_parsing_success ?? false,
        errors: [],
        warnings: [],
        genome_build: 'GRCh38',
        variant_count: variantCount,
        quality_score: (qualityMetrics ?? result.quality_metrics)?.variant_call_quality === 'high' ? 95 :
          (qualityMetrics ?? result.quality_metrics)?.variant_call_quality === 'medium' ? 75 : 50,
        file_size_mb: Math.round(file.size / (1024 * 1024) * 10) / 10
      }

      // Store result BEFORE calling validation callback so it's available when the page reads it
      if (typeof window !== 'undefined') {
        (window as any).__lastAnalysisResult = result
      }

      onValidationComplete(validationResult)

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed. Please try again.'
      setValidationError(errorMessage)
      onError(errorMessage)
      setUploadProgress(null)
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    accept: {
      'text/vcf': ['.vcf'],
      'application/gzip': ['.vcf.gz']
    },
    maxSize: maxFileSize,
    multiple: false,
    disabled: isUploading
  })

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed border-[#39FF14] rounded-xl p-8
            transition-all duration-300
            ${isDragOver
              ? 'bg-[#39FF14]/10 border-[#39FF14] scale-105'
              : 'bg-black/5 border-gray-600 hover:border-[#39FF14] hover:bg-black/10'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <input {...getInputProps()} className="hidden" />

          <div className="text-center">
            {/* Upload Icon */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{
                scale: isDragOver ? 1.05 : 1,
                rotate: isDragOver ? 360 : 0
              }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {uploadProgress?.stage === 'uploading' ? (
                <div className="w-16 h-16 border-4 border-t-4 border-[#39FF14] rounded-full flex items-center justify-center pulse-glow">
                  <UploadCloudIcon className="w-8 h-8 text-[#39FF14]" />
                </div>
              ) : uploadProgress?.stage === 'validating' ? (
                <div className="w-16 h-16 border-4 border-t-4 border-[#39FF14] rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-[#39FF14]" />
                </div>
              ) : uploadProgress?.stage === 'processing' ? (
                <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-t-2 border-blue-300 rounded-full animate-spin" />
                </div>
              ) : uploadProgress?.stage === 'analyzing' ? (
                <div className="w-16 h-16 border-4 border-t-4 border-yellow-500 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-t-2 border-yellow-300 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <UploadCloudIcon className="w-16 h-16 text-gray-400 mb-4" />
                  <FileTextIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-lg font-space-grotesk font-semibold text-[#D9D9D9] mb-2">
                    Drag & Drop VCF File
                  </p>
                  <p className="text-sm text-[#D9D9D9]">
                    or click to browse
                  </p>
                </>
              )}
            </motion.div>

            {/* Upload Text */}
            <div className="mt-4">
              {uploadProgress ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#D9D9D9]">
                      {uploadProgress.message}
                    </span>
                    <span className="text-xs text-[#39FF14]">
                      {Math.round(uploadProgress.progress)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress.progress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#39FF14] to-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-lg font-space-grotesk font-semibold text-[#D9D9D9] mb-2">
                    Ready for Analysis
                  </p>
                  <p className="text-sm text-[#D9D9D9]">
                    Upload your VCF file to begin pharmacogenomic analysis
                  </p>
                  <p className="text-xs text-gray-400">
                    Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB
                  </p>
                </div>
              )}
            </div>

            {/* Error Display */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-100">
                    {validationError}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setValidationError(null)
                    setUploadProgress(null)
                  }}
                  className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadZone
