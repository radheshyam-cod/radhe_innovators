import './globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { SecurityProvider } from '@/providers/SecurityProvider'
import { MotionProvider } from '@/providers/MotionProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { NotificationProvider } from '@/providers/NotificationProvider'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700']
})

export const metadata = {
  title: 'GeneDose.ai - Clinical Decision Support for Pharmacogenomics',
  description: 'Precision medicine platform for pharmacogenomic analysis and drug-gene interaction assessment',
  keywords: ['pharmacogenomics', 'clinical decision support', 'CPIC guidelines', 'genetic testing', 'drug interactions'],
  authors: [{ name: 'GeneDose.ai Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#39FF14',
  robots: 'noindex, nofollow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-black text-[#D9D9D9] antialiased">
        <ThemeProvider>
          <SecurityProvider>
            <NotificationProvider>
              <MotionProvider>
                <ToastProvider>
                  <Navigation />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                </ToastProvider>
              </MotionProvider>
            </NotificationProvider>
          </SecurityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
