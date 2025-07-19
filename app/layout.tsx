import './globals.css'
import { Inter } from 'next/font/google'
import LayoutWrapper from '@/components/LayoutWrapper'
import { DevicesProvider } from '@/lib/DevicesContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Jarvis - Smart Home Control',
  description: 'Modern smart home management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
          <DevicesProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </DevicesProvider>
        </div>
      </body>
    </html>
  )
} 