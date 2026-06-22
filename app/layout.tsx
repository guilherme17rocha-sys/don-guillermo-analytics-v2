import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Don Guillermo Analytics V2',
  description: 'Plataforma de análise Don Guillermo integrada com AVEC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-zinc-50 text-zinc-900`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
