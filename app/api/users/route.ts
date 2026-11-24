import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { apiUser } from '@/lib/auth'
import { ROLE_PERMS, type Role } from '@/lib/perms'

export async function GET() {
  const u = await apiUser('users.manage'); if (u instanceof Response) return u
  const rows = await db.user.findMany({ include: { sites: { select: { id: true } } }, orderBy: { createdAt: 'asc' } })
  return Response.json(rows.map(({ passwordHash, sites, ...x }) => ({ ...x, siteIds: sites.map(s => s.id) })))
}
export async function POST(req: Request) {
  const u = await apiUser('users.manage'); if (u instanceof Response) return u
  const b = await req.json()
  if (!b.password || String(b.password).length < 8) return Response.json({ error: 'Mot de passe : 8 caractères minimum' }, { status: 400 })
  if (!u.isAdmin && (b.role === 'admin' || b.perms?.includes('users.manage'))) return Response.json({ error: 'Réservé à l’admin' }, { status: 403 })
  try {
    await db.user.create({ data: { name: b.name, email: String(b.email).toLowerCase().trim(), role: b.role, perms: b.perms ?? ROLE_PERMS[b.role as Role] ?? [], active: b.active !== false, passwordHash: await bcrypt.hash(b.password, 10), sites: { connect: (b.siteIds || []).map((id: string) => ({ id })) } } })
    return Response.json({ ok: true }, { status: 201 })
  } catch { return Response.json({ error: 'Email déjà utilisé ou données invalides' }, { status: 400 }) }
}
