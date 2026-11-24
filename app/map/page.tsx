import { db } from '@/lib/db'
import { requirePerm, can } from '@/lib/auth'
import MapLoader from '@/components/MapLoader'

export default async function Page() {
  const u = await requirePerm('map.view')
  const sites = await db.site.findMany({
    where: u.isAdmin ? {} : { users: { some: { id: u.id } } },
    include: { devices: { select: { id: true, name: true, serial: true, lastSeen: true } } },
    orderBy: { name: 'asc' },
  })
  return (<><h1>Carte & localisation</h1><MapLoader sites={JSON.parse(JSON.stringify(sites))} canEdit={can(u, 'sites.edit')} /></>)
}
