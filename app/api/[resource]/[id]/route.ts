import { guard, table, pick, siteOk } from '@/lib/resources'
type P = { params: Promise<{ resource: string; id: string }> }
export async function PUT(req: Request, { params }: P) {
  const { resource, id } = await params
  const g = await guard(resource, true); if (g instanceof Response) return g
  const data: any = pick(g.r, await req.json())
  if (g.r.model === 'device' && data.siteId !== undefined && !(await siteOk(g.u, data.siteId))) return Response.json({ error: 'Site non autorisé' }, { status: 403 })
  try { return Response.json(await table(g.r.model).update({ where: { id, ...g.where }, data })) }
  catch { return Response.json({ error: 'Introuvable, interdit ou doublon' }, { status: 400 }) }
}
export async function DELETE(_: Request, { params }: P) {
  const { resource, id } = await params
  const g = await guard(resource, true); if (g instanceof Response) return g
  try { await table(g.r.model).delete({ where: { id, ...g.where } }); return Response.json({ ok: true }) }
  catch { return Response.json({ error: 'Introuvable ou interdit' }, { status: 400 }) }
}
