# Instruções Permanentes — Don Guillermo Analytics V2

## Contexto do Projeto

App de gestão para rede de barbearias/salões **Don Guillermo**.
Repositório: `don-guillermo-analytics-v2` (GitHub: guilherme17rocha-sys)
Stack: Next.js 14 + TypeScript + Firebase (Auth + Firestore) + Vercel
Integração: API REST AVEC módulo franquias (https://api.avec.beauty/reports/)

O dono do projeto **não tem background técnico** — todas as soluções devem ser completas, prontas para usar, sem etapas manuais de código.

---

## Regras Sempre Válidas

### Entregas
- Sempre entregas **completas**, nunca parciais
- Nunca deixar arquivos pela metade ou com `// TODO` sem implementar
- Sempre rodar `npm run build` ao final para confirmar que não há erros
- Se houver erro de build, corrigir antes de considerar a tarefa concluída

### Idioma e Formatação
- Todo texto da interface em **português brasileiro**
- Datas no formato `dd/mm/yyyy`
- Valores monetários no formato `R$ 1.234,56`
- Mensagens de loading: "Carregando..."
- Mensagens de erro: "Erro ao carregar dados. Tente novamente."
- Botões de ação: "Salvar", "Cancelar", "Confirmar", "Excluir"
- Nunca usar termos em inglês na interface visível ao usuário

### Firebase
- Quando houver alteração nas regras do Firestore (`firestore.rules`), **avisar explicitamente** que é necessário fazer deploy manual:
  ```
  firebase deploy --only firestore:rules
  ```
- Nunca alterar dados diretamente no Firestore sem instrução explícita do usuário
- Estrutura de coleções deve seguir o padrão definido no projeto

### Segurança
- Token da API AVEC nunca vai em variável de ambiente — sempre no Firestore via painel admin
- Nunca expor credenciais em logs ou console.log
- Rotas protegidas por middleware de autenticação
- Usuários só acessam dados das unidades atribuídas a eles

---

## Stack e Versões

```
Next.js: 14 (App Router)
TypeScript: strict mode
Firebase: Auth + Firestore (sem Storage, sem Functions)
Tailwind CSS: para estilização
Recharts: para gráficos
Lucide React: para ícones
```

---

## Estrutura do Projeto

```
/app
  /(app)              → Rotas protegidas (requer auth)
    /dashboard
    /analise
    /crm
    /unidades
    /unidades/[id]
    /profissionais
    /evolucao
    /metas
    /financeiro
    /promocoes
    /sincronizacao
    /admin
  /login
  /cadastro
  /aguardando-aprovacao
  /acesso-negado
  /api
    /avec/[reportId]  → Proxy para API AVEC
    /avec/unidades
    /avec/test
    /admin/users
    /admin/token

/lib
  /avec-api.ts        → Cliente central da API AVEC
  /firebase.ts        → Configuração Firebase

/components
  /layout             → Sidebar, Header
  /ui                 → MetricCard, DataTable, ErrorMessage, Badge
  /charts             → PieChart, BarChart, LineChart

/hooks
  /useAvecData.ts
  /useUnidades.ts
  /usePeriodo.ts
  /useAuth.ts

/contexts
  /AuthContext.tsx
  /PeriodoContext.tsx
  /UnidadesContext.tsx

/types
  /avec.ts
  /app.ts
```

---

## API AVEC — Referência Completa

**Base URL:** `https://api.avec.beauty/reports/`

**Headers obrigatórios:**
```
Authorization: {{token}}
Content-Type: application/json
```

**Parâmetros comuns:**
- `page` — número da página (padrão: 1)
- `limit` — máximo 250 registros por página
- `inicio` — data início (formato: `dd/mm/yyyy`)
- `fim` — data fim (formato: `dd/mm/yyyy`)
- `salao_unidade_id` — filtra por unidade específica

**Paginação:** quando `Data.HasMore === true`, buscar próximas páginas até `HasMore === false` e concatenar `Data.Result`.

**Endpoints por tela:**

| Tela | Endpoints |
|------|-----------|
| Dashboard | 1010, 1034, 1035, 2005, 2008, 2011 |
| Análise | 1020, 1031, 1034, 1042, 2006, 2010, 2014, 2186, 2187 |
| CRM | 1035, 1036, 1210, 1211, 2001, 2003, 2004, 2007, 2008, 2009 |
| Unidades | 1010, 1034, 1051, 1064, 2005, 2008, 2051, 2052 |
| Profissionais | 1020, 1106, 1229, 2013 |
| Evolução | 1035, 1036, 2003, 2004, 2005, 2008, 2011, 2012 |
| Metas | 1010, 1034, 2005, 2008 |
| Financeiro | 1034, 1081, 1386, 2186, 2187 |
| Promoções | 1040, 1046, 1056, 1064, 1161, 1162 |
| Sincronização | 2052 (teste de conexão) |

**Todos os endpoints disponíveis:**
```
1010 - Ticket Médio (clientes atendidos)
1014 - Detalhamento Ticket Médio
1020 - Procedimentos realizados
1031 - Serviços realizados por lojas
1033 - Tabela de preços dos serviços
1034 - Total faturado por categoria de serviço
1035 - Retorno Geral
1036 - Retorno (m-1)
1040 - Pontuação Clube da Cera
1042 - Produtos Vendidos no Período por Unidade
1046 - Taxa de Adesão a Promoções
1051 - Número de agendamentos por unidade
1056 - Origem das reservas no período
1057 - Procedimentos por marca (loja-em-loja)
1058 - Clientes atendidos por marca (loja-em-loja)
1059 - Percentual de Faturamento por marca
1063 - Retorno Geral por marca
1064 - Pacotes utilizados nas unidades
1066 - Ticket médio de faturamento por marca
1067 - ADC por marca (loja na loja)
1081 - Faturamento e cálculo de Royalties
1102 - Atendimentos
1106 - ADC (clientes atendidos)
1160 - Tarifa balcão por marca (loja na loja)
1161 - Pacotes vendidos por marca (loja-em-loja)
1162 - Pacotes e pré-vendas vendidas por loja
1163 - Atendimentos por Marca (loja-em-loja)
1210 - Clientes com CPF duplicados
1211 - Clientes com CELULAR duplicados
1229 - Lista de Profissionais de todas as unidades
1386 - Despesas de todas as unidades
2001 - Clientes tratados
2003 - Taxa de Ativação do Período
2004 - Taxa de Ativação Geral
2005 - Atendimentos
2006 - Procedimentos realizados
2007 - Base de clientes geral
2008 - Novos clientes / período
2009 - Lista de contato de clientes
2010 - Lista de produtos cadastrados
2011 - Crescimento do Faturamento por Unidade
2012 - Crescimento do Faturamento por marca
2013 - Lista de profissionais cadastrados
2014 - Itens Vendidos por Loja
2051 - Reservas realizadas por Loja
2052 - Lista de Unidades
2186 - Todos os itens das comandas e comissões
2187 - Todas as comandas agrupadas
```

---

## Firestore — Estrutura de Dados

```
users/{uid}
  - email: string
  - name: string
  - role: "admin" | "user"
  - status: "pending" | "approved" | "blocked"
  - unidades: string[]
  - createdAt: timestamp

settings/global
  - token_avec: string

metas/{ano}/{mes}/{unidade_id}
  - faturamento: number
  - atendimentos: number
  - novos_clientes: number
  - ticket_medio: number
  - createdAt: timestamp

cache/{reportId}/{periodo}/{unidadeId}
  - data: any[]
  - fetchedAt: timestamp
  - expiresAt: timestamp (TTL: 1 hora)
```

---

## Perfis de Acesso

| Perfil | O que pode fazer |
|--------|-----------------|
| Admin | Tudo — aprova usuários, configura token AVEC, vê todas as unidades |
| User aprovado | Vê apenas dados das unidades atribuídas pelo admin |
| User pendente | Só vê tela de aguardo de aprovação |
| User bloqueado | Só vê tela de acesso negado |

---

## Padrões de Código

### Busca de dados da API
Sempre usar o hook `useAvecData` ou o cliente central `/lib/avec-api.ts`. Nunca chamar a API AVEC diretamente de um componente.

### Tratamento de erros
Todo componente que busca dados deve ter:
- Estado de loading com skeleton
- Estado de erro com mensagem amigável e botão "Tentar novamente"
- Estado vazio com mensagem "Nenhum dado encontrado para o período selecionado"

### Componentes de gráfico
Sempre usar os componentes de `/components/charts/`. Nunca importar Recharts diretamente em páginas.

### Formatação de valores
```typescript
// Moeda
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

// Porcentagem
const formatPercent = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(value / 100)

// Data
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR').format(date)
```

---

## Variáveis de Ambiente

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
AVEC_API_BASE_URL=https://api.avec.beauty/reports/
```

O token AVEC **não vai aqui** — é configurado pelo admin dentro do app em `/sincronizacao`.

---

## Deploy

- **Plataforma:** Vercel
- **Repositório:** `guilherme17rocha-sys/don-guillermo-analytics-v2`
- **Branch principal:** `main` ou `master`
- **Build command:** `npm run build`
- **Variáveis de ambiente:** configurar no painel da Vercel

⚠️ Após qualquer alteração em `firestore.rules`, rodar:
```bash
firebase deploy --only firestore:rules
```

---

## Histórico de Versões

### V2.0 — Junho 2026
- Criação do projeto do zero
- Integração com API AVEC módulo franquias
- 10 telas: Dashboard, Análise, CRM, Unidades, Profissionais, Evolução, Metas, Financeiro (novo), Promoções (novo), Sincronização
- Substituição completa do fluxo de upload manual de xlsx
- Sistema de perfis de acesso por unidade

---

## Projeto Anterior

O app v1 (`v0-analitcs-don-guillermo-2`) continua funcionando normalmente com upload manual de xlsx. **Nunca alterar o v1.**
