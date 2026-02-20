'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  CreditCardIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  DownloadIcon, 
  QrCodeIcon,
  ShieldCheckIcon,
  PhoneIcon,
  CalendarIcon,
  FileTextIcon
} from 'lucide-react'
import { PatientWalletCard } from '@/types'

const PatientCardPage = () => {
  const [patientCard, setPatientCard] = useState<PatientWalletCard | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Mock patient card data
    const mockCard: PatientWalletCard = {
      patient_id: 'PATIENT_001',
      patient_name: 'John Doe',
      date_of_birth: '1980-01-15',
      critical_interactions: [
        {
          drug: 'codeine',
          gene: 'CYP2D6',
          risk: 'adjust',
          recommendation: 'Dose adjustment required',
          severity: 'medium'
        },
        {
          drug: 'warfarin',
          gene: 'CYP2C9',
          risk: 'adjust',
          recommendation: 'Dose adjustment required',
          severity: 'medium'
        },
        {
          drug: 'simvastatin',
          gene: 'SLCO1B1',
          risk: 'safe',
          recommendation: 'Standard prescribing',
          severity: 'low'
        }
      ],
      emergency_contact: '555-0123',
      generated_at: new Date().toISOString(),
      qr_code: 'QR_CODE_DATA_HERE'
    }
    setPatientCard(mockCard)
  }, [])

  const handleGenerateCard = async () => {
    setIsGenerating(true)
    try {
      // In a real app, this would call your backend
      const response = await fetch('/api/patient-card/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: 'PATIENT_001',
          include_qr: true,
          format: 'digital'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPatientCard(data)
      }
    } catch (error) {
      console.error('Card generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadCard = () => {
    // In a real app, this would trigger a download
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(patientCard, null, 2)], { type: 'application/json' })
    element.href = URL.createObjectURL(file)
    element.download = `patient-card-${patientCard?.patient_id}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'safe': return 'text-green-400'
      case 'adjust': return 'text-yellow-400'
      case 'toxic': return 'text-red-400'
      case 'ineffective': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'safe': return <CheckCircleIcon className="w-4 h-4" />
      case 'adjust': return <AlertTriangleIcon className="w-4 h-4" />
      case 'toxic': return <AlertTriangleIcon className="w-4 h-4" />
      case 'ineffective': return <AlertTriangleIcon className="w-4 h-4" />
      default: return <ShieldCheckIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-space-grotesk font-bold text-4xl sm:text-3xl lg:text-5xl text-[#D9D9D9]">
              Patient Wallet Card
            </h1>
            <p className="text-xl text-[#D9D9D9] opacity-80">
              Generate and download your pharmacogenomic patient card
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGenerateCard}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#39FF14] text-black font-space-grotesk font-semibold rounded-lg hover-lift transition-all duration-200 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate New Card'}
            </button>
          </div>
        </div>

        {/* Patient Card Display */}
        {patientCard && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl mx-auto"
          >
            {/* Card Front */}
            <div className="glass rounded-xl p-8 mb-6 hover-lift">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-space-grotesk font-bold text-xl text-[#D9D9D9]">
                      GeneDose.ai Patient Card
                    </h2>
                    <p className="text-sm text-[#D9D9D9] opacity-80">
                      Pharmacogenomic Profile
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-[#D9D9D9] opacity-60">
                    Generated: {new Date(patientCard.generated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <UserIcon className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-sm text-[#D9D9D9] opacity-60">Patient Name</span>
                  </div>
                  <p className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
                    {patientCard.patient_name}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-sm text-[#D9D9D9] opacity-60">Date of Birth</span>
                  </div>
                  <p className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
                    {patientCard.date_of_birth}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <PhoneIcon className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-sm text-[#D9D9D9] opacity-60">Emergency Contact</span>
                  </div>
                  <p className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
                    {patientCard.emergency_contact || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileTextIcon className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-sm text-[#D9D9D9] opacity-60">Patient ID</span>
                  </div>
                  <p className="font-space-grotesk font-semibold text-lg text-[#D9D9D9]">
                    {patientCard.patient_id}
                  </p>
                </div>
              </div>

              {/* Critical Interactions */}
              <div className="mb-6">
                <h3 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9] mb-4">
                  Critical Drug Interactions
                </h3>
                
                <div className="space-y-3">
                  {patientCard.critical_interactions.map((interaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getRiskColor(interaction.risk)} bg-opacity-20`}>
                          {getRiskIcon(interaction.risk)}
                        </div>
                        <div>
                          <p className="font-medium text-[#D9D9D9]">
                            {interaction.drug}
                          </p>
                          <p className="text-sm text-[#D9D9D9] opacity-60">
                            {interaction.gene}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getRiskColor(interaction.risk)}`}>
                          {interaction.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-2">
                    <QrCodeIcon className="w-24 h-24 text-black" />
                  </div>
                  <p className="text-sm text-[#D9D9D9] opacity-60">
                    Scan for full profile
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-4 h-4 text-[#39FF14]" />
                  <span className="text-sm text-[#D9D9D9] opacity-60">
                    HIPAA Compliant
                  </span>
                </div>
                
                <button
                  onClick={handleDownloadCard}
                  className="px-4 py-2 bg-[#39FF14] text-black font-space-grotesk font-semibold rounded-lg hover-lift transition-all duration-200"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download Card
                </button>
              </div>
            </div>

            {/* Card Back */}
            <div className="glass rounded-xl p-8 hover-lift">
              <h3 className="font-space-grotesk font-semibold text-lg text-[#D9D9D9] mb-4">
                Medical Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[#D9D9D9] mb-2">Important Notes</h4>
                  <ul className="text-sm text-[#D9D9D9] opacity-80 space-y-1">
                    <li>• This card contains pharmacogenomic information</li>
                    <li>• Share with healthcare providers before prescribing</li>
                    <li>• Update profile annually or with new test results</li>
                    <li>• Keep card with medical information</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-[#D9D9D9] mb-2">Emergency Instructions</h4>
                  <p className="text-sm text-[#D9D9D9] opacity-80">
                    In case of emergency, show this card to medical personnel. 
                    The QR code provides access to your complete pharmacogenomic profile.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-[#D9D9D9] mb-2">Contact Information</h4>
                  <p className="text-sm text-[#D9D9D9] opacity-80">
                    For questions about this card or your pharmacogenomic profile, 
                    contact your healthcare provider or GeneDose.ai support.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PatientCardPage
