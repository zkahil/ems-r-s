import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { makeSession } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const u = await db.user.findUnique({ where: { email: String(email || '').toLowerCase().trim() } })
  if (!u || !u.active || !(await bcrypt.compare(String(password || ''), u.passwordHash)))
    return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
  ;(await cookies()).set('ems_session', await makeSession(u.id), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 604800 })
  return Response.json({ ok: true })
}
