'use client'
import { useEffect, useState } from 'react'
import { PERMS, ROLES, ROLE_PERMS, type Role } from '@/lib/perms'

const empty = { id: '', name: '', email: '', password: '', role: 'consultant', perms: [...ROLE_PERMS.consultant] as string[], siteIds: [] as string[], active: true }
const arr = (d: any) => (Array.isArray(d) ? d : [])

export default function UsersAdmin({ meId }: { meId: string }) {
  const [users, setUsers] = useState<any[]>([]), [sites, setSites] = useState<any[]>([]), [f, setF] = useState<any>(empty), [err, setErr] = useState('')
  const load = () => fetch('/api/users').then(r => r.json()).then(d => setUsers(arr(d)))
  useEffect(() => { load(); fetch('/api/sites').then(r => r.json()).then(d => setSites(arr(d))) }, [])
  const tog = (k: 'perms' | 'siteIds', v: string) => setF((x: any) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((i: string) => i !== v) : [...x[k], v] }))
  const save = async () => {
    const r = await fetch('/api/users' + (f.id ? '/' + f.id : ''), { method: f.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).error || 'Erreur'); return }
    setErr(''); setF(empty); load()
  }
  const del = async (id: string) => { if (confirm('Supprimer ce compte ?')) { const r = await fetch('/api/users/' + id, { method: 'DELETE' }); if (!r.ok) setErr((await r.json()).error); load() } }
  return (
    <div className="grid">
      <div className="card">
        <h3>{f.id ? 'Modifier le compte' : 'Nouveau compte'}</h3>
        <div className="frm">
          <input placeholder="Nom" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <input placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
          <input type="password" placeholder={f.id ? 'Nouveau mot de passe (vide = inchangé)' : 'Mot de passe (8+)'} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          <select value={f.role} onChange={e => setF({ ...f, role: e.target.value, perms: [...ROLE_PERMS[e.target.value as Role]] })}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
          <label className="ck"><input type="checkbox" checked={f.active} onChange={e => setF({ ...f, active: e.target.checked })} />Actif</label>
        </div>
        <h3>Autorisations {f.role === 'admin' && <span className="mu">(admin : tout)</span>}</h3>
        {Object.entries(PERMS).map(([k, l]) => <label key={k} className="ck" style={{ display: 'flex' }}><input type="checkbox" disabled={f.role === 'admin'} checked={f.role === 'admin' || f.perms.includes(k)} onChange={() => tog('perms', k)} />{l}</label>)}
        <h3 style={{ marginTop: 10 }}>Sites accessibles {f.role === 'admin' && <span className="mu">(admin : tous)</span>}</h3>
        {sites.map(s => <label key={s.id} className="ck"><input type="checkbox" checked={f.siteIds.includes(s.id)} onChange={() => tog('siteIds', s.id)} />{s.name}</label>)}
        {!sites.length && <p className="mu">Aucun site.</p>}
        <div className="frm" style={{ marginTop: 10 }}><button className="p" onClick={save}>{f.id ? 'Enregistrer' : '+ Créer le compte'}</button>{f.id && <button onClick={() => { setF(empty); setErr('') }}>Annuler</button>}{err && <span className="er">{err}</span>}</div>
      </div>
      <div className="card tw"><h3>Comptes</h3><table>
        <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Sites</th><th>Actif</th><th /></tr></thead>
        <tbody>{users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.role === 'admin' ? 'tous' : u.siteIds.length}</td><td>{u.active ? '✓' : '—'}</td>
          <td><button onClick={() => { setF({ ...u, password: '' }); setErr('') }}>✎</button> {u.id !== meId && <button className="x" onClick={() => del(u.id)}>✕</button>}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}
