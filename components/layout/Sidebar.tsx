'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BarChart2, Users, Building2, UserCheck,
  TrendingUp, Target, DollarSign, Tag, RefreshCw, Settings, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analise', label: 'Análise', icon: BarChart2 },
  { href: '/crm', label: 'CRM', icon: Users },
  { href: '/unidades', label: 'Unidades', icon: Building2 },
  { href: '/profissionais', label: 'Profissionais', icon: UserCheck },
  { href: '/evolucao', label: 'Evolução', icon: TrendingUp },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/promocoes', label: 'Promoções', icon: Tag },
  { href: '/sincronizacao', label: 'Sincronização', icon: RefreshCw },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-900 text-white w-64">
      <div className="p-4 border-b border-zinc-700 flex items-center justify-center">
        <Image
          src="/logo-don-guillermo.png"
          alt="Don Guillermo"
          height={60}
          width={180}
          style={{ height: 60, width: 'auto' }}
          priority
        />
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-amber-500 text-zinc-900 font-semibold'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition-colors mt-2 border-t border-zinc-700 pt-4 ${
              pathname.startsWith('/admin')
                ? 'bg-amber-500 text-zinc-900 font-semibold'
                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Settings size={18} />
            Admin
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-zinc-700">
        <div className="text-xs text-zinc-400 mb-2 truncate">{profile?.email}</div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-lg text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex-shrink-0">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
