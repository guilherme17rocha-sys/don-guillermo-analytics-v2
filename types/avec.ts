export interface AvecReportResponse {
  Data: {
    Report: {
      Description: string
      RequiredParams: string[]
    }
    Total: Record<string, any>
    Result: Record<string, any>[]
    HasMore: boolean
  }
}

export interface AvecParams {
  inicio: string
  fim: string
  salao_unidade_id?: string
  page?: number
  limit?: number
  [key: string]: any
}

// Endpoint 2052 - Unidades
export interface Unidade {
  id: string
  nome: string
  cidade?: string
  estado?: string
  status?: string
}

// Endpoint 1034 - Faturamento por categoria
export interface FaturamentoCategoria {
  categoria: string
  valor: number
  percentual?: number
}

// Endpoint 1010 / 1014 - Ticket Médio
export interface TicketMedio {
  unidade?: string
  ticket_medio: number
  total_clientes?: number
  total_faturamento?: number
}

// Endpoint 2005 / 1102 - Atendimentos
export interface Atendimento {
  data?: string
  unidade?: string
  total: number
}

// Endpoint 2008 - Novos Clientes
export interface NovoCliente {
  data?: string
  unidade?: string
  total: number
  nome?: string
  telefone?: string
  email?: string
}

// Endpoint 1035 / 1036 - Retorno
export interface Retorno {
  unidade?: string
  total_clientes: number
  clientes_retorno: number
  percentual_retorno: number
}

// Endpoint 2007 - Base de Clientes
export interface Cliente {
  id?: string
  nome: string
  telefone?: string
  email?: string
  ultima_visita?: string
  total_visitas?: number
  cpf?: string
}

// Endpoint 2009 - Lista de Contatos
export interface Contato {
  nome: string
  celular: string
  email?: string
  unidade?: string
}

// Endpoint 1229 / 2013 - Profissionais
export interface Profissional {
  id?: string
  nome: string
  unidade?: string
  status?: string
  procedimentos?: number
  adc?: number
}

// Endpoint 1386 - Despesas
export interface Despesa {
  unidade?: string
  categoria: string
  descricao?: string
  valor: number
  data?: string
}

// Endpoint 1081 - Royalties
export interface Royalty {
  unidade: string
  faturamento_base: number
  percentual_royalty: number
  valor_royalty: number
}

// Endpoint 1046 - Taxa de Adesão a Promoções
export interface TaxaAdesao {
  unidade?: string
  promocao?: string
  total_clientes: number
  clientes_aderentes: number
  taxa: number
}

// Endpoint 1064 - Pacotes
export interface Pacote {
  nome: string
  unidade?: string
  quantidade: number
  valor?: number
}

// Endpoint 1040 - Clube da Cera
export interface ClubeWax {
  cliente?: string
  unidade?: string
  pontos: number
}

// Endpoint 1056 - Origem das Reservas
export interface OrigemReserva {
  origem: string
  total: number
  percentual?: number
}

// Endpoint 2011 / 2012 - Crescimento Faturamento
export interface CrescimentoFaturamento {
  unidade?: string
  marca?: string
  mes?: string
  faturamento: number
  crescimento_percentual?: number
}

// Endpoint 2003 / 2004 - Taxa de Ativação
export interface TaxaAtivacao {
  unidade?: string
  total_clientes: number
  clientes_ativos: number
  taxa: number
}

// Endpoint 1051 - Agendamentos
export interface Agendamento {
  unidade?: string
  total: number
  data?: string
}

// Endpoint 2186 / 2187 - Comandas
export interface Comanda {
  id?: string
  cliente?: string
  unidade?: string
  data?: string
  valor_total: number
  itens?: ComandaItem[]
}

export interface ComandaItem {
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  profissional?: string
  comissao?: number
}
