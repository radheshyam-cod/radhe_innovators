import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        medical: {
          blue: '#0066CC',
          green: '#00A652',
          red: '#DC2626',
          yellow: '#F59E0B',
          gray: '#6B7280',
          light: '#F9FAFB',
        },
        risk: {
          safe: '#10B981',
          adjust: '#F59E0B',
          toxic: '#EF4444',
          ineffective: '#8B5CF6',
          unknown: '#6B7280',
        },
        'medical-bg': '#0B1020',
        'medical-surface': '#111827',
        'medical-surface-soft': '#1F2937',
        'medical-accent': '#38BDF8',
        'medical-accent-soft': '#0EA5E9',
        'medical-danger': '#F97373',
        'medical-warning': '#FBBF24',
        'medical-safe': '#22C55E'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft-elevated': '0 18px 45px rgba(15,23,42,0.65)'
      }
    }
  },
  plugins: []
}

export default config

