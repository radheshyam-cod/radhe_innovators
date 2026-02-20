'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3Icon,
  TrendingUpIcon,
  UsersIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  DownloadIcon,
  FileTextIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react'
import RiskCard from '@/components/RiskCard'
import SeverityBadge from '@/components/SeverityBadge'
import GenotypeBreakdown from '@/components/GenotypeBreakdown'
import CPICReferencePanel from '@/components/CPICReferencePanel'
import LLMExplanationBlock from '@/components/LLMExplanationBlock'

const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGene, setSelectedGene] = useState<string>('all')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("Dashboard useEffect mounted!");
    const fetchLatestAnalysis = async () => {
      console.log("Fetching /api/analysis/latest...");
      try {
        const response = await fetch('/api/analysis/latest');
        console.log("Fetch response received:", response.status, response.ok);
        if (response.ok) {
          const data = await response.json();
          console.log("Response JSON parsed:", data);
          if (data.status !== 'no_data') {
            const apiData = {
              analysis_id: 'analysis_' + data.created_at,
              patient_id: 'PATIENT_001',
              patient_name: data.patient_name,
              date_of_birth: '1990-01-01',
              clinical_notes: '',
              gene_analyses: data.gene_analyses.map((ga: any) => ({
                gene: ga.pharmacogenomic_profile?.primary_gene,
                star_alleles: (ga.pharmacogenomic_profile?.detected_variants || []).map((v: any) => ({
                  gene: ga.pharmacogenomic_profile?.primary_gene,
                  allele: v.rsid || '*1',
                  zygosity: 'unknown',
                  confidence: ga.risk_assessment?.confidence_score ?? 0
                })),
                phenotype: ga.pharmacogenomic_profile?.phenotype,
                risk_category: ga.risk_assessment?.risk_label ?? 'unknown',
                recommendations: [{
                  drug: ga.drug,
                  gene: ga.pharmacogenomic_profile?.primary_gene,
                  level: ga.clinical_recommendation?.evidence_level,
                  recommendation: ga.clinical_recommendation?.recommendation_text,
                  action: ga.clinical_recommendation?.action,
                  evidence: 'CPIC Guideline',
                  explanation: ga.llm_generated_explanation?.summary || ga.llm_generated_explanation?.explanation_text || "No explanation",
                  risk_category: ga.risk_assessment?.risk_label ?? 'unknown',
                  citations: ga.clinical_recommendation?.citations || []
                }],
                processing_time_ms: 0,
                confidence_score: ga.risk_assessment?.confidence_score ?? 0
              })),
              summary: {
                total_genes: data.gene_analyses.length,
                risk_distribution: { safe: 0, adjust: 0, toxic: 0, ineffective: 0, unknown: 0 },
                high_risk_genes: [],
                processing_time_seconds: data.processing_time_seconds,
                variant_count: 0,
                genome_build: 'GRCh38',
                quality_score: 100
              },
              created_at: data.created_at,
              processing_time_seconds: data.processing_time_seconds,
              status: data.status
            };
            console.log("Setting analysis data:", apiData);
            setAnalysisData(apiData);
          } else {
            console.log("Status is no_data, ignoring.");
          }
        } else {
          console.error("Fetch returned not ok:", response.status);
        }
      } catch (err) {
        console.error("Failed to fetch latest analysis caught error:", err);
      } finally {
        console.log("Finally block executing - setting isLoading to false");
        setIsLoading(false);
      }
    };

    fetchLatestAnalysis();
  }, []);

  const filteredGenes = analysisData?.gene_analyses.filter((gene: any) =>
    selectedGene === 'all' || gene.gene === selectedGene
  ) || []

  const mockGuidelines = [
    {
      gene: 'CYP2D6',
      drug: 'codeine',
      level: 'A' as const,
      guideline_url: 'https://cpicpgx.org/guideline/cyp2d6/codeine',
      recommendation_text: 'Avoid codeine use in CYP2D6 ultrarapid metabolizers due to risk of toxicity. Consider alternative analgesics in poor metabolizers due to reduced efficacy.',
      evidence_summary: 'Strong evidence for codeine metabolism variation based on CYP2D6 genotype',
      last_updated: '2023-01-01'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#D9D9D9]">
        <ActivityIcon className="w-12 h-12 text-[#39FF14] animate-pulse mb-4" />
        <p className="font-space-grotesk text-xl">Loading dashboard...</p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#D9D9D9] p-4 text-center">
        <ActivityIcon className="w-16 h-16 text-[#39FF14] mb-4 opacity-50" />
        <h1 className="font-space-grotesk font-bold text-3xl mb-2">No Analysis Data Found</h1>
        <p className="text-xl text-gray-400 max-w-lg mb-8">
          It looks like you haven't run any pharmacogenomic analyses yet, or the database is currently empty.
        </p>
        <button
          onClick={() => window.location.href = '/analysis'}
          className="px-6 py-3 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-opacity-80 transition-all"
        >
          Run New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-space-grotesk font-bold text-4xl sm:text-3xl lg:text-5xl text-[#D9D9D9]">
              Clinical Dashboard
            </h1>
            <p className="text-xl text-[#D9D9D9] opacity-80">
              Pharmacogenomic analysis results for {analysisData?.patient_name}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 glass rounded-lg hover-lift">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass rounded-xl p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3Icon className="w-8 h-8 text-[#39FF14]" />
              <span className="text-2xl font-bold cyber-lime">
                {analysisData?.summary.total_genes}
              </span>
            </div>
            <h3 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
              Genes Analyzed
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="glass rounded-xl p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <AlertTriangleIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {analysisData?.summary.risk_distribution.adjust}
              </span>
            </div>
            <h3 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
              Adjustments Required
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
            className="glass rounded-xl p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {analysisData?.summary.risk_distribution.safe}
              </span>
            </div>
            <h3 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
              Safe Prescribing
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
            className="glass rounded-xl p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <ActivityIcon className="w-8 h-8 text-[#39FF14]" />
              <span className="text-2xl font-bold cyber-lime">
                {Math.round(analysisData?.summary.quality_score || 0)}%
              </span>
            </div>
            <h3 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
              Quality Score
            </h3>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search genes, drugs, or recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-[#D9D9D9] placeholder-gray-400 focus:outline-none focus:border-[#39FF14]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FilterIcon className="w-5 h-5 text-[#D9D9D9]" />
            <select
              value={selectedGene}
              onChange={(e) => setSelectedGene(e.target.value)}
              className="px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-[#D9D9D9] focus:outline-none focus:border-[#39FF14]"
            >
              <option value="all">All Genes</option>
              <option value="CYP2D6">CYP2D6</option>
              <option value="CYP2C19">CYP2C19</option>
              <option value="CYP2C9">CYP2C9</option>
              <option value="SLCO1B1">SLCO1B1</option>
              <option value="TPMT">TPMT</option>
              <option value="DPYD">DPYD</option>
            </select>
          </div>
        </div>

        {/* Gene Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredGenes.map((geneAnalysis: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <RiskCard
                gene={geneAnalysis.gene}
                riskCategory={geneAnalysis.risk_category}
                phenotype={geneAnalysis.phenotype}
                recommendations={geneAnalysis.recommendations.length}
                description={`${geneAnalysis.gene} - ${geneAnalysis.phenotype}`}
                confidence={geneAnalysis.confidence_score}
                onClick={() => {
                  // Navigate to detailed view
                  console.log('Navigate to detailed view for', geneAnalysis.gene)
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Detailed Analysis Section */}
        <div className="space-y-8">
          {filteredGenes.map((geneAnalysis: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-6 hover-lift"
            >
              {/* Gene Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-space-grotesk font-bold text-xl text-[#D9D9D9]">
                  {geneAnalysis.gene}
                </h3>
                <SeverityBadge
                  riskCategory={geneAnalysis.risk_category}
                  size="lg"
                  showIcon={true}
                />
              </div>

              {/* Genotype Breakdown */}
              <GenotypeBreakdown
                gene={geneAnalysis.gene}
                starAlleles={geneAnalysis.star_alleles}
                phenotype={geneAnalysis.phenotype}
                activityScore={geneAnalysis.activity_score?.score}
                confidence={geneAnalysis.confidence_score}
              />

              {/* CPIC Reference Panel */}
              <CPICReferencePanel
                gene={geneAnalysis.gene}
                drug={geneAnalysis.recommendations[0]?.drug || ''}
                guidelines={mockGuidelines}
              />

              {/* LLM Explanation */}
              <LLMExplanationBlock
                gene={geneAnalysis.gene}
                drug={geneAnalysis.recommendations[0]?.drug || ''}
                explanation={geneAnalysis.recommendations[0]?.explanation || ''}
                citations={geneAnalysis.recommendations[0]?.citations || []}
                confidence={geneAnalysis.confidence_score}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
