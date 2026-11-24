import { db } from './db'
import { getUser, can, type User } from './auth'
import type { Perm } from './perms'

type R = { model: string; fields: string[]; read: Perm; write: Perm; scope?: (u: User) => object }
const own = (u: User) => (u.isAdmin ? {} : { users: { some: { id: u.id } } })
// Chaque ressource : champs éditables, autorisation lecture/écriture, filtre par sites de l'utilisateur
export const RES: Record<string, R> = {
  sites: { model: 'site', fields: ['name', 'address', 'lat', 'lng'], read: 'sites.view', write: 'sites.edit', scope: own },
  devices: { model: 'device', fields: ['serial', 'name', 'model', 'mac', 'firmware', 'siteId', 'location'], read: 'devices.view', write: 'devices.edit', scope: u => (u.isAdmin ? {} : { site: own(u) }) },
  metrics: { model: 'metric', fields: ['path', 'label', 'unit', 'min', 'max'], read: 'metrics.view', write: 'metrics.edit' },
  widgets: { model: 'widget', fields: ['title', 'type', 'metrics', 'deviceId', 'range', 'norm'], read: 'dashboard.view', write: 'studio.use' },
}
export const table = (m: string) => (db as any)[m]
export const pick = (r: { fields: string[] }, b: any) => Object.fromEntries(r.fields.filter(f => f in b).map(f => [f, b[f]]))
export const siteOk = async (u: User, id?: string | null) => u.isAdmin || (!!id && (await db.site.count({ where: { id, ...own(u) } })) > 0)

export async function guard(resource: string, write: boolean) {
  const r = RES[resource]
  if (!r) return Response.json({ error: 'not found' }, { status: 404 })
  const u = await getUser()
  if (!u) return Response.json({ error: 'Non connecté' }, { status: 401 })
  if (!can(u, write ? r.write : r.read)) return Response.json({ error: 'Autorisation manquante : ' + (write ? r.write : r.read) }, { status: 403 })
  return { r, u, where: r.scope?.(u) ?? {} }
}
