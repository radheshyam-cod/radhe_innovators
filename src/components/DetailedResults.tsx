'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DownloadIcon, ActivityIcon, FileTextIcon, PillIcon, AlertTriangleIcon, CopyIcon, FileJsonIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import SeverityBadge from '@/components/SeverityBadge'
import LLMExplanationBlock from '@/components/LLMExplanationBlock'

// We estimate a risk score 0-100 based on the severity
const getRiskScore = (severity: string): number => {
    switch (severity.toLowerCase()) {
        case 'critical': return 95
        case 'high': return 80
        case 'moderate': return 50
        case 'low': return 20
        case 'none':
        case 'safe': return 5
        default: return 50 // unknown
    }
}

// Mocked alternatives mapped by some common drug classes 
// In a real app this would come from the backend CDSDrugResult model
const getMocksForDrug = (drugName: string) => {
    const normalized = drugName.toLowerCase()
    if (normalized.includes('codeine')) {
        return [
            { name: 'Morphine', reason: 'Not dependent on CYP2D6 for activation' },
            { name: 'Oxycodone', reason: 'Less dependent on CYP2D6' },
            { name: 'Hydromorphone', reason: 'Not dependent on CYP2D6' }
        ]
    } else if (normalized.includes('clopidogrel')) {
        return [
            { name: 'Prasugrel', reason: 'Not dependent on CYP2C19' },
            { name: 'Ticagrelor', reason: 'Not dependent on CYP2C19' }
        ]
    } else if (normalized.includes('simvastatin')) {
        return [
            { name: 'Rosuvastatin', reason: 'Lower risk of statin-induced myopathy (SLCO1B1 independent)' },
            { name: 'Pravastatin', reason: 'Not metabolized by CYP3A4' }
        ]
    } else if (normalized.includes('warfarin')) {
        return [
            { name: 'Apixaban', reason: 'Direct oral anticoagulant (DOAC) - no genetic testing required' },
            { name: 'Rivaroxaban', reason: 'Direct oral anticoagulant (DOAC)' }
        ]
    }

    return [
        { name: 'Alternative A', reason: 'Standard protocol alternative' },
        { name: 'Alternative B', reason: 'Standard protocol alternative' }
    ]
}

interface DetailedResultsProps {
    analysisResult: any; // Using the CDSPolypharmacyResponse or single format passed down
    expandedDrugs?: Record<string, boolean>;
    toggleDrugExpanded?: (drugName: string) => void;
}

export default function DetailedResults({ analysisResult, expandedDrugs = {}, toggleDrugExpanded }: DetailedResultsProps) {
    // Extract results array
    const results = analysisResult.results || (analysisResult.drug ? [analysisResult] : [])

    // For local fallback if props aren't provided
    const [localExpanded, setLocalExpanded] = React.useState<Record<string, boolean>>({})

    // Initialize local state if no props
    React.useEffect(() => {
        if (!toggleDrugExpanded) {
            const initial: Record<string, boolean> = {}
            results.forEach((r: any) => initial[r.drug] = true)
            setLocalExpanded(initial)
        }
    }, [results.length])

    const isExpanded = (drug: string) => {
        if (toggleDrugExpanded) return expandedDrugs[drug]
        return localExpanded[drug]
    }

    const handleToggle = (drug: string) => {
        if (toggleDrugExpanded) {
            toggleDrugExpanded(drug)
        } else {
            setLocalExpanded(prev => ({ ...prev, [drug]: !prev[drug] }))
        }
    }

    const handlePrintPDF = () => {
        window.print()
    }

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysisResult, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "pharmacogenomics_report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const handleCopyJSON = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
            alert("JSON copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    if (!results.length) return null

    return (
        <div className="space-y-12">
            {/* Header with Download Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 print:hidden">
                <h2 className="font-space-grotesk font-bold text-3xl text-[#D9D9D9]">
                    Pharmacogenomic Summary Report
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleCopyJSON}
                        className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 flex items-center gap-2 border border-gray-600 transition-colors"
                        title="Copy JSON to Clipboard"
                    >
                        <CopyIcon className="w-5 h-5" />
                        Copy JSON
                    </button>
                    <button
                        onClick={handleDownloadJSON}
                        className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 flex items-center gap-2 border border-gray-600 transition-colors"
                        title="Download JSON"
                    >
                        <FileJsonIcon className="w-5 h-5" />
                        Download JSON
                    </button>
                    <button
                        onClick={handlePrintPDF}
                        className="px-6 py-3 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#39FF14]/80 flex items-center gap-2 hover-lift shadow-lg shadow-[#39FF14]/20"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download PDF Report
                    </button>
                </div>
            </div>

            <div className="print:hidden">
                <p className="text-gray-400">
                    This comprehensive report outlines patient-specific pharmacogenomic risks and evidence-based therapeutic recommendations.
                </p>
            </div>

            {results.map((result: any, index: number) => {
                const severity = result.risk_assessment?.severity || 'unknown'
                const riskLabel = result.risk_assessment?.risk_label || 'unknown'
                const score = getRiskScore(severity)

                // Compute Risk Card styling
                let ringColor = 'text-green-500' // low
                let shadowColor = 'shadow-green-500/20'
                if (score >= 80) {
                    ringColor = 'text-red-500' // high/critical
                    shadowColor = 'shadow-red-500/20'
                } else if (score >= 50) {
                    ringColor = 'text-orange-500' // moderate
                    shadowColor = 'shadow-orange-500/20'
                }

                const altDrugs = getMocksForDrug(result.drug)
                const expanded = isExpanded(result.drug)

                return (
                    <motion.div
                        key={`${result.drug}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-2xl overflow-hidden border border-gray-800 shadow-xl mb-12 page-break-after-always print:shadow-none print:border-gray-300 print:text-black print:bg-white"
                    >
                        {/* Report Header for Paper/PDF & Expand Toggle */}
                        <div
                            className="p-6 bg-black/40 border-b border-gray-800 flex items-center justify-between print:bg-white print:border-gray-300 cursor-pointer hover:bg-black/60 transition-colors print:pointer-events-none"
                            onClick={() => handleToggle(result.drug)}
                        >
                            <div className="flex items-center gap-4">
                                <PillIcon className="w-8 h-8 text-[#39FF14] print:hidden" />
                                <div>
                                    <h3 className="font-space-grotesk font-bold text-2xl uppercase tracking-wider text-white print:text-black">
                                        {result.drug}
                                    </h3>
                                    <p className="text-sm text-gray-400 print:text-gray-600">
                                        Target Gene: <span className="font-semibold text-gray-300 print:text-black">{result.pharmacogenomic_profile?.primary_gene}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden print:block text-right">
                                    <p className="font-bold text-xl">GeneDose.ai Labs</p>
                                    <p className="text-sm text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="print:hidden">
                                    {expanded ? (
                                        <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                                    ) : (
                                        <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {expanded && (
                            <div className="p-6 md:p-8 space-y-10">

                                {/* Top Section: Big Risk Score & Badge */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/20 p-6 md:p-8 rounded-2xl print:bg-gray-50 border border-gray-800 print:border-gray-200">

                                    {/* Score Circular UI */}
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <p className="text-gray-400 font-medium mb-4 print:text-gray-600">Calculated Clinical Risk Score</p>
                                        <div className={`relative w-40 h-40 rounded-full flex items-center justify-center shadow-2xl ${shadowColor} border border-gray-800 print:border-gray-300 print:shadow-none bg-black print:bg-white`}>
                                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-gray-800 print:text-gray-200"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    className={`${ringColor} transition-all duration-1000 ease-out`}
                                                    strokeDasharray={`${score}, 100`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                            <div className="text-center">
                                                <span className="text-5xl font-bold font-space-grotesk text-white print:text-black">
                                                    {score}
                                                </span>
                                                <span className="text-sm text-gray-400 block print:text-gray-500">/ 100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Level Badge & High-Level Summary */}
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-gray-400 font-medium mb-3 print:text-gray-600">Overall Risk Level</p>
                                            <div className="inline-block scale-125 origin-left">
                                                <SeverityBadge riskCategory={riskLabel} size="lg" showIcon />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-800 print:border-gray-200">
                                            <p className="text-gray-300 print:text-gray-800 text-lg leading-relaxed">
                                                Given the patient's genetic profile across the <strong className="text-white print:text-black">{result.pharmacogenomic_profile?.primary_gene}</strong> locus,
                                                there is a <span className="font-semibold uppercase">{severity}</span> clinical risk associated with standard dosing of <span className="capitalize">{result.drug}</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Explanation Grid */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-xl font-bold text-white print:text-black mb-6">
                                        <ActivityIcon className="w-6 h-6 text-[#39FF14] print:hidden" />
                                        Clinical Pharmacogenomic Profile
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Drug Card */}
                                        <div className="bg-black/40 border border-gray-800 p-5 rounded-xl print:bg-white print:border-gray-300">
                                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 print:text-gray-500">Drug</p>
                                            <p className="text-lg font-bold text-white uppercase print:text-black">{result.drug}</p>
                                        </div>

                                        {/* Gene Card */}
                                        <div className="bg-black/40 border border-gray-800 p-5 rounded-xl print:bg-white print:border-gray-300">
                                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 print:text-gray-500">Gene</p>
                                            <p className="text-lg font-bold text-white print:text-black">{result.pharmacogenomic_profile?.primary_gene}</p>
                                        </div>

                                        {/* Phenotype Card */}
                                        <div className="bg-black/40 border border-gray-800 p-5 rounded-xl print:bg-white print:border-gray-300 md:col-span-2 lg:col-span-1">
                                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 print:text-gray-500">Predicted Phenotype</p>
                                            <p className="text-lg font-bold text-white print:text-black">{result.pharmacogenomic_profile?.phenotype}</p>
                                            <p className="text-sm text-gray-500 mt-1 print:text-gray-600">Diplotype: {result.pharmacogenomic_profile?.diplotype}</p>
                                        </div>

                                        {/* Mechanism Card */}
                                        <div className="bg-black/40 border border-gray-800 p-5 rounded-xl print:bg-white print:border-gray-300 md:col-span-2 lg:col-span-1">
                                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 print:text-gray-500">Clinical Impact</p>
                                            <p className="text-lg font-bold text-white capitalize print:text-black">{severity} Risk</p>
                                            <p className="text-sm text-gray-500 mt-1 print:text-gray-600">Confidence: {((result.risk_assessment?.confidence_score ?? 0) * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendation Block */}
                                <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 p-6 md:p-8 rounded-2xl print:bg-green-50 print:border-green-300">
                                    <h4 className="flex items-center gap-2 text-xl font-bold text-white print:text-black mb-4">
                                        <FileTextIcon className="w-6 h-6 text-[#39FF14] print:hidden" />
                                        Guideline Recommendation & Action
                                    </h4>

                                    <div className="space-y-4">
                                        <p className="text-[#D9D9D9] print:text-gray-800 text-lg leading-relaxed font-medium">
                                            {result.clinical_recommendation?.recommendation_text}
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                            <div className="flex-1 bg-black/50 p-4 rounded-xl print:bg-white print:border-gray-200 print:border">
                                                <p className="text-xs text-gray-400 uppercase mb-1 print:text-gray-500">Primary Action</p>
                                                <p className="font-semibold text-white print:text-black">{result.clinical_recommendation?.action}</p>
                                            </div>
                                            {result.clinical_recommendation?.evidence_level && (
                                                <div className="flex-1 bg-black/50 p-4 rounded-xl print:bg-white print:border-gray-200 print:border">
                                                    <p className="text-xs text-gray-400 uppercase mb-1 print:text-gray-500">Evidence Level</p>
                                                    <p className="font-semibold text-white print:text-black">Level {result.clinical_recommendation.evidence_level}</p>
                                                </div>
                                            )}
                                        </div>

                                        {result.clinical_recommendation?.contraindication && (
                                            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center gap-3 print:bg-red-50 print:border-red-300">
                                                <AlertTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                                                <p className="text-red-200 print:text-red-800 font-bold tracking-wide">
                                                    SEVERE CONTRAINDICATION: Avoid prescribing this medication.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Alternative Drugs Section */}
                                {score >= 50 && ( // Generally only show alternatives if moderate or higher risk
                                    <div className="pt-6">
                                        <h4 className="text-xl font-bold text-white print:text-black mb-4">Suggested Protocol Alternatives</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {altDrugs.map((alt, idx) => (
                                                <div key={idx} className="flex flex-col p-4 bg-black/30 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors cursor-default print:border-gray-300 print:bg-white">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center print:border-blue-300 print:bg-blue-50">
                                                            <PillIcon className="w-4 h-4 text-blue-400 print:text-blue-600" />
                                                        </div>
                                                        <span className="font-bold text-white text-lg print:text-black">{alt.name}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 pl-11 print:text-gray-600">
                                                        {alt.reason}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Advanced LLM Detail (Optional deep dive) */}
                                <div className="pt-8 border-t border-gray-800 print:hidden">
                                    <h4 className="text-lg font-bold text-gray-300 mb-4">Deep Dive (AI Generated Exegesis)</h4>
                                    {result.llm_generated_explanation && (
                                        <LLMExplanationBlock
                                            gene={result.pharmacogenomic_profile?.primary_gene || ''}
                                            drug={result.drug || ''}
                                            explanation={
                                                typeof result.llm_generated_explanation === 'string'
                                                    ? result.llm_generated_explanation
                                                    : (result.llm_generated_explanation?.explanation_text ??
                                                        result.llm_generated_explanation?.summary ??
                                                        '')
                                            }
                                            citations={result.clinical_recommendation?.citations || []}
                                            confidence={result.risk_assessment?.confidence_score ?? 0}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )
            })}
        </div>
    )
}
