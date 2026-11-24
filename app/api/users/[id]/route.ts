import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { apiUser } from '@/lib/auth'

type P = { params: Promise<{ id: string }> }
export async function PUT(req: Request, { params }: P) {
  const u = await apiUser('users.manage'); if (u instanceof Response) return u
  const { id } = await params, b = await req.json()
  const t = await db.user.findUnique({ where: { id } })
  if (!t) return Response.json({ error: 'Introuvable' }, { status: 404 })
  if (!u.isAdmin && (t.role === 'admin' || b.role === 'admin' || b.perms?.includes('users.manage'))) return Response.json({ error: 'Réservé à l’admin' }, { status: 403 })
  if (id === u.id && b.active === false) return Response.json({ error: 'Tu ne peux pas te désactiver' }, { status: 400 })
  const data: any = { name: b.name, email: String(b.email).toLowerCase().trim(), role: b.role, perms: b.perms, active: b.active, sites: { set: (b.siteIds || []).map((i: string) => ({ id: i })) } }
  if (b.password) { if (String(b.password).length < 8) return Response.json({ error: 'Mot de passe : 8 caractères minimum' }, { status: 400 }); data.passwordHash = await bcrypt.hash(b.password, 10) }
  try { await db.user.update({ where: { id }, data }); return Response.json({ ok: true }) }
  catch { return Response.json({ error: 'Email déjà utilisé ou données invalides' }, { status: 400 }) }
}
export async function DELETE(_: Request, { params }: P) {
  const u = await apiUser('users.manage'); if (u instanceof Response) return u
  const { id } = await params
  if (id === u.id) return Response.json({ error: 'Tu ne peux pas te supprimer' }, { status: 400 })
  const t = await db.user.findUnique({ where: { id } })
  if (t?.role === 'admin' && !u.isAdmin) return Response.json({ error: 'Réservé à l’admin' }, { status: 403 })
  await db.user.delete({ where: { id } })
  return Response.json({ ok: true })
}
