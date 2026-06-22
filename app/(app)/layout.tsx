'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { PeriodoProvider } from '@/contexts/PeriodoContext'
import { UnidadesProvider } from '@/contexts/UnidadesContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (profile?.status === 'pending') {
      router.push('/aguardando-aprovacao')
      return
    }

    if (profile?.status === 'blocked') {
      router.push('/acesso-negado')
      return
    }
  }, [user, profile, loading, router])

  if (loading || !user || !profile || profile.status !== 'approved') {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <PeriodoProvider>
      <UnidadesProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </UnidadesProvider>
    </PeriodoProvider>
  )
}
