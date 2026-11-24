import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose'
import { db } from './db'
import { PERMS, type Perm, type Role } from './perms'

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me')
export const makeSession = (uid: string) => new SignJWT({ uid }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key())
async function readSession(tok?: string) {
  if (!tok) return null
  try { return (await jwtVerify(tok, key())).payload.uid as string } catch { return null }
}
export type User = { id: string; name: string; email: string; role: Role; perms: string[]; siteIds: string[]; isAdmin: boolean }

export async function getUser(): Promise<User | null> {
  const uid = await readSession((await cookies()).get('ems_session')?.value)
  if (!uid) return null
  const u = await db.user.findUnique({ where: { id: uid }, include: { sites: { select: { id: true } } } })
  if (!u || !u.active) return null
  const isAdmin = u.role === 'admin'
  return { id: u.id, name: u.name, email: u.email, role: u.role as Role, perms: isAdmin ? Object.keys(PERMS) : u.perms, siteIds: u.sites.map(s => s.id), isAdmin }
}
export const can = (u: User | null, p: Perm) => !!u && (u.isAdmin || u.perms.includes(p))

// Pages : redirige si pas connecté / pas autorisé
export async function requirePerm(p: Perm) {
  const u = await getUser()
  if (!u) redirect('/login')
  if (!can(u, p)) redirect('/')
  return u
}
// API : renvoie l'utilisateur ou une Response 401/403
export async function apiUser(p: Perm) {
  const u = await getUser()
  if (!u) return Response.json({ error: 'Non connecté' }, { status: 401 })
  if (!can(u, p)) return Response.json({ error: 'Autorisation manquante : ' + p }, { status: 403 })
  return u
}
