'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Dashboard', icon: '▦', perm: 'dashboard.view' },
  { href: '/map', label: 'Carte', icon: '◉', perm: 'map.view' },
  { href: '/sites', label: 'Sites', icon: '⌂', perm: 'sites.view' },
  { href: '/devices', label: 'Appareils (hardware)', icon: '⌁', perm: 'devices.view' },
  { href: '/metrics', label: 'Paramètres', icon: '≋', perm: 'metrics.view' },
  { href: '/studio', label: 'Studio graphes', icon: '✎', perm: 'studio.use' },
  { href: '/users', label: 'Comptes & droits', icon: '☺', perm: 'users.manage' },
]

export default function Shell({ user, children }: { user: { name: string; role: string; perms: string[] }; children: React.ReactNode }) {
  const [open, setOpen] = useState(true) // sidebar qui s'ouvre / se ferme
  const path = usePathname()
  const toggleTheme = () => {
    const el = document.documentElement, t = el.dataset.theme === 'scada' ? 'odoo' : 'scada'
    el.dataset.theme = t; localStorage.setItem('ems_theme', t)
  }
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }
  return (
    <>
      <header className="hd">
        <button onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <b>⚡ EMS</b><span className="sp" />
        <button onClick={toggleTheme} title="SCADA (sombre) ⇄ Odoo (clair)">◐</button>
        <span className="mu">{user.name} · {user.role}</span>
        <button onClick={logout}>Sortir</button>
      </header>
      <div className="wrap">
        <nav className={'sb' + (open ? '' : ' off')}>
          {NAV.filter(n => user.perms.includes(n.perm)).map(n => (
            <Link key={n.href} href={n.href} className={path === n.href ? 'on' : ''}><span>{n.icon}</span>{n.label}</Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </>
  )
}
