import { requirePerm } from '@/lib/auth'
import UsersAdmin from '@/components/UsersAdmin'
export default async function Page() { const u = await requirePerm('users.manage'); return (<><h1>Comptes & droits</h1><UsersAdmin meId={u.id} /></>) }
