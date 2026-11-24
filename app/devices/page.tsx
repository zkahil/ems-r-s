import { requirePerm, can } from '@/lib/auth'
import Crud from '@/components/Crud'

export default async function Page() {
  const u = await requirePerm('devices.view')
  return (<><h1>Appareils (identification hardware)</h1>
    <Crud resource="devices" canWrite={can(u, 'devices.edit')} fields={[
      { key: 'serial', label: 'N° série' }, { key: 'name', label: 'Nom' }, { key: 'model', label: 'Modèle' }, { key: 'mac', label: 'MAC' },
      { key: 'firmware', label: 'Firmware' }, { key: 'siteId', label: 'Site', type: 'site' }, { key: 'location', label: 'Emplacement (texte)' },
      { key: 'token', label: 'Token API', type: 'readonly' }, { key: 'lastSeen', label: 'Dernier envoi', type: 'readonly' }]} /></>)
}
