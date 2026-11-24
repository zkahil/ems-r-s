import { requirePerm } from '@/lib/auth'
import Dashboard from '@/components/Dashboard'
export default async function Page() { await requirePerm('dashboard.view'); return (<><h1>Dashboard</h1><Dashboard /></>) }
