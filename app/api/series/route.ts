import { db } from '@/lib/db'
import { flatten } from '@/lib/flatten'
import { apiUser } from '@/lib/auth'
const H: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168 }
export async function GET(req: Request) {
  const u = await apiUser('dashboard.view'); if (u instanceof Response) return u
  const q = new URL(req.url).searchParams
  const ms = (q.get('metrics') || '').split(',').filter(Boolean).slice(0, 5), dev = q.get('device')
  const since = new Date(Date.now() - (H[q.get('range') || '24h'] || 24) * 36e5)
  // seulement les appareils des sites auxquels l'utilisateur a accès
  const ids = (await db.device.findMany({ where: u.isAdmin ? {} : { site: { users: { some: { id: u.id } } } }, select: { id: true } })).map(d => d.id)
  const deviceId = dev ? (ids.includes(dev) ? dev : '-') : { in: ids }
  const rows = await db.reading.findMany({ where: { ts: { gte: since }, deviceId }, orderBy: { ts: 'asc' }, take: 2000, select: { ts: true, payload: true } })
  return Response.json(rows.map((r: any) => { const f = flatten(r.payload), o: any = { t: r.ts }; ms.forEach(m => (o[m] = typeof f[m] === 'boolean' ? +f[m] : f[m] ?? null)); return o }))
}
