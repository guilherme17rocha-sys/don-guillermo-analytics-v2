'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useUnidades } from '@/hooks/useUnidades'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { CheckCircle, XCircle, Edit2, RefreshCw } from 'lucide-react'

interface UserRow {
  uid: string
  email: string
  name: string
  role: string
  status: string
  unidades: string[]
}

export default function AdminPage() {
  const { profile } = useAuth()
  const { unidades } = useUnidades()
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [selectedUnidades, setSelectedUnidades] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const snap = await getDocs(collection(db, 'users'))
      const list: UserRow[] = snap.docs.map(d => ({
        uid: d.id,
        email: d.data().email || '',
        name: d.data().name || '',
        role: d.data().role || 'user',
        status: d.data().status || 'pending',
        unidades: d.data().unidades || [],
      }))
      setUsers(list)
    } catch (err: any) {
      setError(`Erro ao carregar usuários: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!profile) return
    if (profile.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadUsers()
  }, [profile, router, loadUsers])

  async function updateUser(uid: string, updates: Record<string, any>) {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', uid), updates)
      await loadUsers()
      setEditUser(null)
    } catch (err: any) {
      setError(`Erro ao salvar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  function statusBadge(status: string) {
    const map: Record<string, { label: string; variant: any }> = {
      approved: { label: 'Aprovado', variant: 'success' },
      pending:  { label: 'Pendente', variant: 'warning' },
      blocked:  { label: 'Bloqueado', variant: 'error' },
    }
    const cfg = map[status] || { label: status, variant: 'default' }
    return <Badge label={cfg.label} variant={cfg.variant} />
  }

  if (!profile || profile.role !== 'admin') return null

  const pending = users.filter(u => u.status === 'pending')

  return (
    <div className="flex flex-col h-full">
      <Header title="Painel de Admin" />
      <div className="flex-1 p-6 overflow-auto space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Aprovações pendentes — ação rápida */}
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 className="font-semibold text-amber-800 mb-4">
              Aprovações Pendentes ({pending.length})
            </h3>
            <div className="space-y-3">
              {pending.map(u => (
                <div key={u.uid} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100">
                  <div>
                    <p className="font-medium text-zinc-800 text-sm">{u.name || u.email}</p>
                    <p className="text-xs text-zinc-400">{u.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditUser(u); setSelectedUnidades(u.unidades || []) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle size={14} />
                      Aprovar
                    </button>
                    <button
                      onClick={() => updateUser(u.uid, { status: 'blocked' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircle size={14} />
                      Bloquear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela com TODOS os usuários */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-800">
              Todos os Usuários {!loading && `(${users.length})`}
            </h3>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'name',     label: 'Nome',     render: r => r.name || '-' },
              { key: 'email',    label: 'Email' },
              { key: 'role',     label: 'Perfil',   render: r => r.role === 'admin'
                  ? <Badge label="Admin" variant="info" />
                  : <Badge label="Usuário" /> },
              { key: 'status',   label: 'Status',   render: r => statusBadge(r.status) },
              { key: 'unidades', label: 'Unidades', render: r =>
                  (r.unidades?.length || 0) === 0 ? 'Todas' : `${r.unidades.length} unidade(s)` },
              {
                key: 'actions', label: 'Ações', sortable: false,
                render: r => (
                  <button
                    onClick={() => { setEditUser(r); setSelectedUnidades(r.unidades || []) }}
                    className="p-1.5 text-zinc-400 hover:text-amber-600 rounded transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                ),
              },
            ]}
            data={users}
            loading={loading}
            emptyMessage="Nenhum usuário cadastrado"
          />
        </div>

        {/* Modal de edição */}
        {editUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
              <h3 className="font-semibold text-zinc-800 mb-1">{editUser.name || editUser.email}</h3>
              <p className="text-sm text-zinc-400 mb-5">{editUser.email}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-600 mb-2">Status</label>
                  <div className="flex gap-2">
                    {(['approved', 'pending', 'blocked'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setEditUser({ ...editUser, status: s })}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          editUser.status === s
                            ? 'border-amber-400 bg-amber-50 text-amber-800 font-medium'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {{ approved: 'Aprovado', pending: 'Pendente', blocked: 'Bloqueado' }[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-600 mb-2">Unidades permitidas</label>
                  <p className="text-xs text-zinc-400 mb-2">Deixe vazio para liberar todas as unidades.</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {unidades.length === 0 ? (
                      <p className="text-xs text-zinc-400">Nenhuma unidade carregada. Configure o token AVEC em Sincronização primeiro.</p>
                    ) : (
                      unidades.map(u => (
                        <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUnidades.includes(u.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedUnidades(prev => [...prev, u.id])
                              } else {
                                setSelectedUnidades(prev => prev.filter(id => id !== u.id))
                              }
                            }}
                            className="accent-amber-500"
                          />
                          <span className="text-sm text-zinc-700">{u.nome}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateUser(editUser.uid, { status: editUser.status, unidades: selectedUnidades })}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
