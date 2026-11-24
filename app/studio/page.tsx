import { requirePerm } from '@/lib/auth'
import Studio from '@/components/Studio'
export default async function Page() { await requirePerm('studio.use'); return (<><h1>Studio graphes</h1><Studio /></>) }
