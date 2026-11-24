import { requirePerm, can } from '@/lib/auth'
import Crud from '@/components/Crud'

export default async function Page() {
  const u = await requirePerm('metrics.view')
  return (<><h1>Paramètres</h1>
    <Crud resource="metrics" canWrite={can(u, 'metrics.edit')} fields={[
      { key: 'path', label: 'Chemin JSON (ex: solar.power_kw)' }, { key: 'label', label: 'Libellé' }, { key: 'unit', label: 'Unité' },
      { key: 'min', label: 'Min', type: 'number' }, { key: 'max', label: 'Max', type: 'number' }, { key: 'auto', label: 'Auto', type: 'readonly' }]} /></>)
}
