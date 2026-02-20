'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircle, HeartPulse, FileText, Calendar, Mail, Phone,
  Pill, Activity, AlertTriangle, CheckCircle, Edit3, Save
} from 'lucide-react'
import SeverityBadge from '@/components/SeverityBadge'

const MOCK_PATIENT = {
  id: 'PAT-001',
  name: 'John Doe',
  dateOfBirth: '1990-03-15',
  gender: 'Male',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  bloodType: 'O+',
  allergies: ['Penicillin', 'Sulfa drugs'],
  conditions: ['Hypertension', 'Type 2 Diabetes'],
  currentMedications: [
    { name: 'Warfarin', dose: '5mg', frequency: 'Once daily', gene: 'CYP2C9', risk: 'adjust' },
    { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', gene: 'N/A', risk: 'safe' },
    { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', gene: 'N/A', risk: 'safe' },
  ],
  recentAnalyses: [
    { id: 'ANL-001', date: '2026-02-19', drugs: ['warfarin', 'codeine'], risk: 'toxic' },
    { id: 'ANL-002', date: '2026-02-15', drugs: ['simvastatin'], risk: 'safe' },
  ],
}

export default function PatientCardPage() {
  const [isEditing, setIsEditing] = useState(false)
  const patient = MOCK_PATIENT

  return (
    <div className="min-h-screen bg-black text-[#D9D9D9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="font-space-grotesk font-bold text-4xl lg:text-5xl">Patient Profile</h1>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
            >
              {isEditing ? <Save className="w-4 h-4 text-[#39FF14]" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#39FF14]/30 to-blue-500/20 border-2 border-[#39FF14]/40 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold font-space-grotesk text-[#39FF14]">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h2 className="font-space-grotesk font-bold text-xl">{patient.name}</h2>
              <p className="text-sm text-gray-500 font-mono">{patient.id}</p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Calendar, label: 'Date of Birth', value: new Date(patient.dateOfBirth).toLocaleDateString() },
                { icon: UserCircle, label: 'Gender', value: patient.gender },
                { icon: HeartPulse, label: 'Blood Type', value: patient.bloodType },
                { icon: Mail, label: 'Email', value: patient.email },
                { icon: Phone, label: 'Phone', value: patient.phone },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/5">
                  <item.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Medical Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Allergies */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-space-grotesk font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Allergies
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map(a => (
                  <span key={a} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-300">{a}</span>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-space-grotesk font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                Active Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map(c => (
                  <span key={c} className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-300">{c}</span>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-space-grotesk font-semibold mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-400" />
                Current Medications
              </h3>
              <div className="space-y-2">
                {patient.currentMedications.map(med => (
                  <div key={med.name} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.dose} — {med.frequency}</p>
                    </div>
                    <SeverityBadge riskCategory={med.risk as any} size="sm" showIcon />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="font-space-grotesk font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#39FF14]" />
              Recent Analyses
            </h3>
            <div className="space-y-3">
              {patient.recentAnalyses.map(analysis => (
                <div key={analysis.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#39FF14]/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[#39FF14]">{analysis.id}</span>
                    <SeverityBadge riskCategory={analysis.risk as any} size="sm" showIcon />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{new Date(analysis.date).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.drugs.map(d => (
                      <span key={d} className="px-2 py-0.5 text-xs bg-white/5 rounded-full text-gray-400 capitalize">{d}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Genomic Summary */}
            <div className="mt-6 p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl">
              <h4 className="text-sm font-semibold text-[#39FF14] mb-2">Genomic Summary</h4>
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between"><span>CYP2D6</span><span className="text-yellow-400">Intermediate Metabolizer</span></div>
                <div className="flex justify-between"><span>CYP2C9</span><span className="text-red-400">Poor Metabolizer</span></div>
                <div className="flex justify-between"><span>CYP2C19</span><span className="text-green-400">Normal Metabolizer</span></div>
                <div className="flex justify-between"><span>SLCO1B1</span><span className="text-green-400">Normal Function</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
