'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { CheckCircle, XCircle, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react'

export default function SincronizacaoPage() {
  const { profile } = useAuth()
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [unidades, setUnidades] = useState<any[]>([])
  const [savedToken, setSavedToken] = useState('')

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'settings', 'global'))
      if (snap.exists()) {
        const t = snap.data().token_avec || ''
        setSavedToken(t)
        setToken(t)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'global'), { token_avec: token }, { merge: true })
      setSavedToken(token)
      setStatusMsg('Token salvo com sucesso!')
      setStatus('success')
    } catch (err: any) {
      setStatusMsg(err.message)
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setStatus('idle')
    setUnidades([])
    try {
      const res = await fetch('/api/avec/test')
      const json = await res.json()
      if (json.success) {
        setStatus('success')
        setStatusMsg(`Conexão OK! ${json.unidades?.length || 0} unidade(s) encontrada(s).`)
        setUnidades(json.unidades || [])
      } else {
        setStatus('error')
        setStatusMsg(json.error || 'Falha na conexão')
      }
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err.message)
    } finally {
      setTesting(false)
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="flex flex-col h-full">
      <Header title="Sincronização" />
      <div className="flex-1 p-6 overflow-auto space-y-6">

        {/* Status da Conexão */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-4">Status da Integração AVEC</h3>
          <div className="flex items-center gap-3">
            {savedToken ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">Token configurado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500">
                <XCircle size={20} />
                <span className="text-sm font-medium">Token não configurado</span>
              </div>
            )}
            <button
              onClick={handleTest}
              disabled={testing || !savedToken}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors ml-auto"
            >
              <RefreshCw size={15} className={testing ? 'animate-spin' : ''} />
              Testar Conexão
            </button>
          </div>

          {status !== 'idle' && (
            <div className={`mt-4 flex items-start gap-2 p-3 rounded-lg text-sm ${
              status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status === 'success' ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
              {statusMsg}
            </div>
          )}
        </div>

        {/* Configuração do Token (admin only) */}
        {isAdmin && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-amber-500" />
              <h3 className="font-semibold text-zinc-800">Configuração do Token AVEC</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">Apenas Admin</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Token de autenticação AVEC</label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 pr-12"
                    placeholder="Cole o token AVEC aqui..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !token}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Salvar Token
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unidades encontradas */}
        {unidades.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Unidades Encontradas ({unidades.length})</h3>
            <div className="space-y-2">
              {unidades.map((u, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{u.salao || u.nome || u.name || 'Unidade'}</p>
                    <p className="text-xs text-zinc-400">ID: {u.salao_id || u.id || u.unidade_id || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações sobre cache */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-2">Sobre o Cache</h3>
          <p className="text-sm text-zinc-500">
            Os dados da API AVEC são armazenados em cache por <strong>1 hora</strong> para otimizar o desempenho.
            Ao testar a conexão, os dados são buscados diretamente da API sem cache.
          </p>
        </div>
      </div>
    </div>
  )
}
