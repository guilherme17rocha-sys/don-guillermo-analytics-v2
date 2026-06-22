export type UserRole = 'admin' | 'user'
export type UserStatus = 'pending' | 'approved' | 'blocked'

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  unidades: string[]
  token_avec: string
  createdAt: any
}

export interface Meta {
  unidade_id: string
  faturamento: number
  atendimentos: number
  novos_clientes: number
  ticket_medio: number
  ano: number
  mes: number
}

export interface PeriodoState {
  inicio: string
  fim: string
  label: string
}

export interface UnidadeOption {
  id: string
  nome: string
}
