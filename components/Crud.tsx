'use client'
import { useEffect, useState } from 'react'
export type Field = { key: string; label: string; type?: 'number' | 'readonly' | 'site' }
const arr = (d: any) => (Array.isArray(d) ? d : [])

export default function Crud({ resource, fields, canWrite }: { resource: string; fields: Field[]; canWrite: boolean }) {
  const [rows, setRows] = useState<any[]>([]), [sites, setSites] = useState<any[]>([]), [form, setForm] = useState<any>({}), [edit, setEdit] = useState<string | null>(null), [err, setErr] = useState('')
  const load = () => fetch('/api/' + resource).then(r => r.json()).then(d => setRows(arr(d)))
  useEffect(() => { load(); if (fields.some(f => f.type === 'site')) fetch('/api/sites').then(r => r.json()).then(d => setSites(arr(d))) }, [])
  const save = async () => {
    const body: any = {}
    fields.filter(f => f.type !== 'readonly').forEach(f => { const v = form[f.key]; if (v !== undefined && v !== '' && v !== null) body[f.key] = f.type === 'number' ? Number(v) : v })
    const r = await fetch('/api/' + resource + (edit ? '/' + edit : ''), { method: edit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).error || 'Erreur ' + r.status); return }
    setErr(''); setForm({}); setEdit(null); load()
  }
  const del = async (id: string) => { if (confirm('Supprimer ?')) { await fetch(`/api/${resource}/${id}`, { method: 'DELETE' }); load() } }
  const cell = (f: Field, r: any) => f.type === 'site' ? sites.find(s => s.id === r[f.key])?.name ?? '' : String(r[f.key] ?? '')
  return (
    <div className="card">
      {canWrite && (
        <div className="frm">
          {fields.filter(f => f.type !== 'readonly').map(f => f.type === 'site'
            ? <select key={f.key} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}><option value="">{f.label}</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            : <input key={f.key} placeholder={f.label} type={f.type === 'number' ? 'number' : 'text'} step="any" value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />)}
          <button className="p" onClick={save}>{edit ? 'Enregistrer' : '+ Ajouter'}</button>
          {edit && <button onClick={() => { setEdit(null); setForm({}) }}>Annuler</button>}
          {err && <span className="er">{err}</span>}
        </div>
      )}
      <div className="tw"><table>
        <thead><tr>{fields.map(f => <th key={f.key}>{f.label}</th>)}{canWrite && <th />}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              {fields.map(f => <td key={f.key}>{cell(f, r)}</td>)}
              {canWrite && <td><button onClick={() => { setEdit(r.id); setForm(r) }}>✎</button> <button className="x" onClick={() => del(r.id)}>✕</button></td>}
            </tr>
          ))}
          {!rows.length && <tr><td className="mu" colSpan={fields.length + 1}>Aucune donnée</td></tr>}
        </tbody>
      </table></div>
    </div>
  )
}
