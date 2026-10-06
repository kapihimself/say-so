import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'BISING (Bisa English) 🦕 — Belajar Inggris Bareng Guru AI',
  description:
    'Platform belajar bahasa Inggris virtual dengan guru AI bilingual. Ngobrol, dikoreksi pelan-pelan, dari B1 sampai C2. Lu bisa, kok.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={nunito.variable} suppressHydrationWarning>
      <body
        className="bg-[var(--color-cloud)] text-[var(--color-warm-text)] antialiased min-h-screen font-sans"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
