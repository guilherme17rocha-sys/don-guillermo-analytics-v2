'use client'

import { Ban, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AcessoNegadoPage() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="bg-zinc-800 rounded-2xl p-8 shadow-2xl text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-red-500/20 rounded-full">
          <Ban size={40} className="text-red-400" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-white mb-3">Acesso negado</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Seu acesso foi bloqueado. Entre em contato com o administrador.
      </p>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 mx-auto text-sm text-zinc-400 hover:text-red-400 transition-colors"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  )
}
