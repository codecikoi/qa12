import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'QA12 — Get 12 Testers. Ship Faster.',
  description: 'Pass Google Play closed testing in 14 days. 13,000+ real testers ready.',
  openGraph: {
    title: 'QA12',
    description: 'Get 12 testers for Google Play. Ship faster.',
    url: 'https://qa12.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>{children}</body>
    </html>
  )
}
