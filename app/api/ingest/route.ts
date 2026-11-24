import { after } from 'next/server'
import { db } from '@/lib/db'
import { flatten } from '@/lib/flatten'

// Le Raspberry envoie : POST /api/ingest  Authorization: Bearer <device.token>  + JSON libre
export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const dev = token ? await db.device.findUnique({ where: { token } }) : null
  if (!dev) return new Response(null, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return Response.json({ error: 'invalid json' }, { status: 400 }) }
  const ts = body?.ts ? new Date(body.ts) : new Date()
  const r = await db.reading.create({ data: { deviceId: dev.id, ts, payload: body } })
  after(async () => { // traitement après la réponse 200 : lastSeen + auto-découverte des paramètres
    await db.device.update({ where: { id: dev.id }, data: { lastSeen: new Date() } })
    const f = flatten(body)
    const paths = Object.keys(f).filter(k => !['device_id', 'ts'].includes(k) && ['number', 'boolean'].includes(typeof f[k]))
    await db.metric.createMany({ data: paths.map(path => ({ path, label: path, auto: true })), skipDuplicates: true })
  })
  return Response.json({ ok: true, id: r.id })
}
