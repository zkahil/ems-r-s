import './globals.css'
import Shell from '@/components/Shell'
import { getUser } from '@/lib/auth'

export const metadata = { title: 'EMS' }
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await getUser() // pas connecté (page /login) : pas de header ni de sidebar
  return (
    <html lang="fr" data-theme="scada" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme=localStorage.getItem('ems_theme')||'scada'" }} /></head>
      <body>{u ? <Shell user={{ name: u.name, role: u.role, perms: u.perms }}>{children}</Shell> : children}</body>
    </html>
  )
}
