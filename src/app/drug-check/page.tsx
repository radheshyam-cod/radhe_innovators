'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SearchIcon,
  CheckCircleIcon,
  BookOpenIcon,
  FilterIcon,
  XIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DrugSearchResult } from '@/types'

const DrugCheckPage = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DrugSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null)
  const [selectedGene, setSelectedGene] = useState<string | null>(null) // Added missing state

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return
    }

    setIsSearching(true)
    try {
      // In a real app, this would query your backend
      const response = await fetch('/api/drug-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleDrugSelect = (drug: DrugSearchResult) => {
    setSelectedDrug(drug.drug_name)
    router.push(`/drug-check/${drug.drug_name}`)
  }

  const filteredResults = searchResults.filter(result =>
    (selectedGene ? result.relevant_genes.includes(selectedGene) : true)
  )

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="font-space-grotesk font-bold text-4xl sm:text-3xl lg:text-5xl text-[#D9D9D9]">
            Drug Interaction Checker
          </h1>
          <p className="text-xl text-[#D9D9D9] opacity-80 mt-2">
            Search medications for potential pharmacogenomic interactions
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search genes, drugs, or recommendations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-4 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-[#D9D9D9] placeholder-gray-400 focus:outline-none focus:border-[#39FF14]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-3 bg-[#39FF14] text-black font-space-grotesk font-semibold rounded-lg hover-lift transition-all duration-200 flex items-center"
            >
              <SearchIcon className="w-5 h-5 mr-2" />
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="mt-8">
            <h2 className="font-space-grotesk font-bold text-3xl text-[#D9D9D9] mb-6">
              Search Results
            </h2>

            <div className="space-y-4">
              {filteredResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-6 hover-lift cursor-pointer"
                  onClick={() => handleDrugSelect(result)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#39FF14]/20 border border-[#39FF14]/50 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-[#39FF14]" />
                      </div>
                      <span className="text-lg font-bold text-[#D9D9D9]">
                        {result.drug_name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-gray-400">
                        {result.relevant_genes.length} relevant gene{result.relevant_genes.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DrugCheckPage
