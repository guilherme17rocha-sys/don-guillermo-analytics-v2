'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { getUserProfile } from '@/lib/auth'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await signIn(email, password)
      const profile = await getUserProfile(user.uid)

      if (!profile) {
        setError('Perfil não encontrado. Contate o administrador.')
        return
      }

      if (profile.status === 'pending') {
        router.push('/aguardando-aprovacao')
        return
      }

      if (profile.status === 'blocked') {
        router.push('/acesso-negado')
        return
      }

      router.push('/dashboard')
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos.')
      } else if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado.')
      } else {
        setError(err.message || 'Erro ao fazer login.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-800 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Entrar na plataforma</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400 transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Senha</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400 transition-colors pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={18} />
              Entrar
            </>
          )}
        </button>
      </form>

      <p className="text-center text-zinc-400 text-sm mt-6">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-amber-400 hover:text-amber-300 font-medium">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
