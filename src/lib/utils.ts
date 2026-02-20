/**
 * Utility functions for CDS frontend
 */

export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

export function getRiskColor(riskCategory: string): string {
  switch (riskCategory.toLowerCase()) {
    case 'safe':
      return 'text-green-400 bg-green-400/20'
    case 'adjust':
      return 'text-yellow-400 bg-yellow-400/20'
    case 'toxic':
      return 'text-red-400 bg-red-400/20'
    case 'ineffective':
      return 'text-orange-400 bg-orange-400/20'
    case 'unknown':
      return 'text-gray-400 bg-gray-400/20'
    default:
      return 'text-gray-400 bg-gray-400/20'
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'none':
      return 'text-green-400'
    case 'low':
      return 'text-blue-400'
    case 'moderate':
      return 'text-yellow-400'
    case 'high':
      return 'text-orange-400'
    case 'critical':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}
