'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeftIcon, BookOpenIcon } from 'lucide-react'
import Link from 'next/link'
import { getGenesForDrug } from '@/lib/gene-drug-data'

export default function DrugDetailPage() {
  const params = useParams()
  const router = useRouter()
  const drug = typeof params.drug === 'string' ? decodeURIComponent(params.drug) : ''
  const [genes, setGenes] = useState<string[]>([])

  useEffect(() => {
    if (drug) {
      setGenes(getGenesForDrug(drug))
    }
  }, [drug])

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/drug-check"
          className="inline-flex items-center gap-2 text-[#39FF14] hover:underline mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Drug Checker
        </Link>
        <h1 className="font-space-grotesk font-bold text-4xl text-[#D9D9D9] capitalize mb-2">
          {drug || 'Unknown drug'}
        </h1>
        <p className="text-gray-400 mb-8">
          Pharmacogenomic genes and CPIC guidelines
        </p>
        <div className="glass rounded-xl p-6">
          <h2 className="font-space-grotesk font-semibold text-xl text-[#D9D9D9] mb-4 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-[#39FF14]" />
            Relevant genes
          </h2>
          {genes.length > 0 ? (
            <ul className="space-y-2">
              {genes.map((g) => (
                <li
                  key={g}
                  className="px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-[#39FF14] font-mono"
                >
                  {g}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No gene data found for this drug.</p>
          )}
        </div>
      </div>
    </div>
  )
}
