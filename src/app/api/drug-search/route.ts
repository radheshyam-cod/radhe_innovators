import { NextRequest, NextResponse } from 'next/server'
import { GENE_DRUG_PAIRS, getGenesForDrug } from '@/lib/gene-drug-data'
import type { DrugSearchResult } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = typeof body.query === 'string' ? body.query.trim() : ''
    if (!query) {
      return NextResponse.json({ results: [] })
    }
    const q = query.toLowerCase()
    const seen = new Set<string>()
    const results: DrugSearchResult[] = []
    for (const { gene, drug } of GENE_DRUG_PAIRS) {
      if (seen.has(drug)) continue
      const match =
        drug.toLowerCase().includes(q) ||
        gene.toLowerCase().includes(q) ||
        drug.toLowerCase() === q ||
        gene.toLowerCase() === q
      if (match) {
        seen.add(drug)
        const relevant_genes = getGenesForDrug(drug)
        results.push({
          drug_name: drug,
          relevant_genes,
          guidelines: [],
          summary: `Pharmacogenomic guidance for ${drug} (genes: ${relevant_genes.join(', ')})`,
        })
      }
    }
    return NextResponse.json({ results })
  } catch (e) {
    console.error('drug-search error', e)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
