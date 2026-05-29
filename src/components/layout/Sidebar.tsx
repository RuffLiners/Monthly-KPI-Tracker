'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Megaphone,
  HeartHandshake,
  Package,
  GitCompare,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/overview',  label: 'Overview',    icon: LayoutDashboard },
  { href: '/upload',    label: 'Upload',       icon: Upload },
  { href: '/financial', label: 'Financial',    icon: DollarSign },
  { href: '/channels',  label: 'Channels',     icon: ShoppingCart },
  { href: '/marketing', label: 'Marketing',    icon: Megaphone },
  { href: '/cx',        label: 'Customer XP',  icon: HeartHandshake },
  { href: '/operations',label: 'Operations',   icon: Package },
  { href: '/compare',   label: 'Compare',      icon: GitCompare },
  { href: '/ai',        label: 'AI Analyst',   icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Ruff Liners</p>
            <p className="text-xs text-slate-500">KPI Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-4 py-3 border-t border-slate-200">
        <p className="text-xs text-slate-400">brandon@ruffliners.com</p>
      </div>
    </aside>
  )
}
