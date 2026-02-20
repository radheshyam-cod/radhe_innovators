'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Pill, AlertTriangle, Search, Plus, X, Dna, ArrowRight, CheckCircle, Info
} from 'lucide-react'
import { GENE_DRUG_PAIRS, getGenesForDrug } from '@/lib/gene-drug-data'

export default function DrugCheckPage() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const allDrugs = useMemo(() =>
    [...new Set(GENE_DRUG_PAIRS.map(p => p.drug))].sort(),
    []
  )

  const filteredDrugs = allDrugs.filter(d =>
    d.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedDrugs.includes(d)
  )

  const addDrug = (drug: string) => {
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs([...selectedDrugs, drug])
      setSearchTerm('')
    }
  }

  const removeDrug = (drug: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d !== drug))
  }

  // Find overlapping genes
  const interactions = useMemo(() => {
    if (selectedDrugs.length < 2) return []

    const drugGeneMap: Record<string, string[]> = {}
    selectedDrugs.forEach(drug => {
      drugGeneMap[drug] = getGenesForDrug(drug)
    })

    const overlaps: { gene: string; drugs: string[]; riskLevel: string }[] = []
    const allGenes = [...new Set(Object.values(drugGeneMap).flat())]

    allGenes.forEach(gene => {
      const drugsWithGene = selectedDrugs.filter(d => drugGeneMap[d]?.includes(gene))
      if (drugsWithGene.length >= 2) {
        overlaps.push({
          gene,
          drugs: drugsWithGene,
          riskLevel: drugsWithGene.length > 2 ? 'high' : 'moderate',
        })
      }
    })

    return overlaps
  }, [selectedDrugs])

  const geneCards = useMemo(() => {
    return selectedDrugs.map(drug => ({
      drug,
      genes: getGenesForDrug(drug),
    }))
  }, [selectedDrugs])

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Pill className="w-5 h-5 text-orange-400" />
            </div>
            <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Drug Interaction Checker</h1>
          </div>
          <p className="text-lg text-gray-400 mt-2">Check gene-based interactions between multiple drugs — no VCF upload needed</p>
        </motion.div>

        {/* Drug Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <h2 className="font-space-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#39FF14]" />
            Select Drugs to Check
          </h2>

          {/* Selected drugs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDrugs.map(drug => (
              <span
                key={drug}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full text-sm font-medium text-[#39FF14] capitalize"
              >
                <Pill className="w-3.5 h-3.5" />
                {drug}
                <button onClick={() => removeDrug(drug)} className="ml-1 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {selectedDrugs.length === 0 && (
              <p className="text-gray-500 text-sm">No drugs selected. Search and add drugs below.</p>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a drug (e.g., warfarin, codeine, simvastatin)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#D9D9D9] placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50 transition-colors"
            />
          </div>

          {searchTerm && (
            <div className="mt-2 max-h-48 overflow-y-auto bg-black/50 border border-white/10 rounded-xl">
              {filteredDrugs.slice(0, 15).map(drug => (
                <button
                  key={drug}
                  onClick={() => addDrug(drug)}
                  className="w-full px-4 py-2.5 text-left text-sm capitalize hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                  <span>{drug}</span>
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              ))}
              {filteredDrugs.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-500">No drugs found matching &quot;{searchTerm}&quot;</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Interaction Alerts */}
        {interactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="font-space-grotesk font-semibold text-xl mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Gene Overlap Warnings ({interactions.length})
            </h2>
            <div className="space-y-3">
              {interactions.map((inter, i) => (
                <motion.div
                  key={inter.gene}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl p-5 border ${inter.riskLevel === 'high'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${inter.riskLevel === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                    <div>
                      <h3 className="font-semibold text-[#D9D9D9] mb-1 flex items-center gap-2">
                        <Dna className="w-4 h-4 text-[#39FF14]" />
                        {inter.gene} — Shared Metabolic Pathway
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        The following drugs are metabolized by the same gene, which may affect efficacy or toxicity:
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {inter.drugs.map((d, j) => (
                          <span key={d} className="flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs font-medium text-[#D9D9D9] capitalize">{d}</span>
                            {j < inter.drugs.length - 1 && <ArrowRight className="w-3 h-3 text-gray-500" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedDrugs.length >= 2 && interactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl p-6 bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-300">No Gene Overlaps Detected</h3>
                <p className="text-sm text-gray-400">These drugs do not share common pharmacogenomic metabolic pathways.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gene Mapping for Each Drug */}
        {geneCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-space-grotesk font-semibold text-xl mb-4 flex items-center gap-2">
              <Dna className="w-5 h-5 text-[#39FF14]" />
              Gene-Drug Mapping
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geneCards.map(({ drug, genes }) => (
                <div key={drug} className="glass rounded-xl p-5 hover-lift">
                  <h3 className="font-space-grotesk font-semibold text-lg mb-3 capitalize flex items-center gap-2">
                    <Pill className="w-4 h-4 text-orange-400" />
                    {drug}
                  </h3>
                  <div className="space-y-1.5">
                    {genes.map(gene => (
                      <div key={gene} className="flex items-center gap-2 text-sm">
                        <Dna className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span className="text-gray-300 font-mono">{gene}</span>
                        {interactions.some(inter => inter.gene === gene) && (
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" title="Shared with another selected drug" />
                        )}
                      </div>
                    ))}
                    {genes.length === 0 && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> No gene data available
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {selectedDrugs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <Pill className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="font-space-grotesk font-semibold text-xl text-gray-500 mb-2">Select Two or More Drugs</h2>
            <p className="text-gray-600 max-w-md mx-auto">Search and add drugs above to see their gene-based interactions and metabolic pathway overlaps.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
