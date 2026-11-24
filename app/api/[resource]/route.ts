import { guard, table, pick, siteOk } from '@/lib/resources'
type P = { params: Promise<{ resource: string }> }
export async function GET(_: Request, { params }: P) {
  const g = await guard((await params).resource, false); if (g instanceof Response) return g
  return Response.json(await table(g.r.model).findMany({ where: g.where, orderBy: { id: 'asc' } }))
}
export async function POST(req: Request, { params }: P) {
  const g = await guard((await params).resource, true); if (g instanceof Response) return g
  const data: any = pick(g.r, await req.json())
  if (g.r.model === 'site' && !g.u.isAdmin) data.users = { connect: { id: g.u.id } } // le créateur garde l'accès
  if (g.r.model === 'device' && !(await siteOk(g.u, data.siteId))) return Response.json({ error: 'Site non autorisé' }, { status: 403 })
  try { return Response.json(await table(g.r.model).create({ data }), { status: 201 }) }
  catch { return Response.json({ error: 'Données invalides ou doublon' }, { status: 400 }) }
}
