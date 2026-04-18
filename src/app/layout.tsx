import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const geist = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: "NeW Space — The Space for What's New",
  description: 'Social media for trends, viral content and real-time conversations.',
  themeColor: '#0a0a0b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body className={`${geist.variable} ${syne.variable} font-sans bg-bg-primary text-text-primary antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a1e',
              color: '#f0f0f2',
              border: '1px solid #2a2a2e',
              borderRadius: '12px',
              fontFamily: 'var(--font-geist)',
            },
          }}
        />
      </body>
    </html>
  )
}