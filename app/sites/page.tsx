import Link from 'next/link'
import { requirePerm, can } from '@/lib/auth'
import Crud from '@/components/Crud'

export default async function Page() {
  const u = await requirePerm('sites.view')
  return (<><h1>Sites</h1>
    <p className="mu">Latitude / longitude à la main, ou clique directement sur la <Link href="/map" style={{ color: 'var(--ac)' }}>carte</Link>.</p>
    <Crud resource="sites" canWrite={can(u, 'sites.edit')} fields={[
      { key: 'name', label: 'Nom du site' }, { key: 'address', label: 'Adresse' }, { key: 'lat', label: 'Latitude', type: 'number' }, { key: 'lng', label: 'Longitude', type: 'number' }]} /></>)
}
