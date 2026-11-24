import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const tok = req.cookies.get('ems_session')?.value
  let ok = false
  if (tok) { try { await jwtVerify(tok, new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me')); ok = true } catch {} }
  if (ok) return NextResponse.next()
  if (req.nextUrl.pathname.startsWith('/api')) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  return NextResponse.redirect(new URL('/login', req.url))
}
// /login, l'auth et l'ingestion Raspberry (token device) restent publics
export const config = { matcher: ['/((?!login|api/auth|api/ingest|_next|favicon.ico).*)'] }
