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
  const [testResult, setTestResult] = useState<any[]>([])
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
    setTestResult([])
    try {
      const today = new Date()
      const inicio = `01/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
      const fim = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
      const url = `https://api.avec.beauty/reports/2005?inicio=${inicio}&fim=${fim}&limit=250`
      const res = await fetch(url, {
        headers: {
          Authorization: savedToken,
          'Content-Type': 'application/json',
        },
      })
      if (res.status === 401 || res.status === 403) {
        throw new Error('Token AVEC inválido ou expirado. Atualize o token.')
      }
      if (!res.ok) {
        throw new Error(`Erro na API AVEC (${res.status}): ${res.statusText}`)
      }
      const json = await res.json()
      const results = json?.Data?.Result || []
      setStatus('success')
      setStatusMsg(`Conexão OK! ${results.length} registro(s) de atendimentos encontrado(s) no mês atual.`)
      setTestResult(results)
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

        {/* Resultado do teste */}
        {testResult.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Atendimentos no Mês Atual ({testResult.length})</h3>
            <div className="space-y-2">
              {testResult.slice(0, 10).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{item.salao || item.unidade || item.loja || 'Atendimento'}</p>
                    <p className="text-xs text-zinc-400">
                      {item.total_atendimentos != null && `Atendimentos: ${item.total_atendimentos}`}
                      {item.total_atendimentos != null && item.periodo && ' · '}
                      {item.periodo && `Período: ${item.periodo}`}
                      {!item.total_atendimentos && !item.periodo && `Registro ${i + 1}`}
                    </p>
                  </div>
                </div>
              ))}
              {testResult.length > 10 && (
                <p className="text-xs text-zinc-400 text-center pt-2">
                  ... e mais {testResult.length - 10} registro(s)
                </p>
              )}
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
