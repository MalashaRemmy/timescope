import type { Metadata } from 'next'
import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display:  'swap',
})

const spaceMono = Space_Mono({
  subsets:  ['latin'],
  weight:   ['400', '700'],
  variable: '--font-space-mono',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'TimeScope',
  description: 'A temporal visualization platform — navigate time like a map.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⏱</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable}`}>
      <body className="antialiased bg-bg-primary text-text-primary overflow-hidden">
        {children}
      </body>
    </html>
  )
}
