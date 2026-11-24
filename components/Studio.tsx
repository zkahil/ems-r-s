'use client'
import { useEffect, useState } from 'react'
import WidgetView from './WidgetView'

// Studio : l'admin choisit 3 à 5 paramètres + type de graphe, prévisualise, puis enregistre le widget
export default function Studio() {
  const [metrics, setMetrics] = useState<any[]>([]), [devices, setDevices] = useState<any[]>([]), [widgets, setWidgets] = useState<any[]>([])
  const [sel, setSel] = useState<string[]>([]), [type, setType] = useState('line'), [range, setRange] = useState('24h'), [dev, setDev] = useState(''), [norm, setNorm] = useState(false), [title, setTitle] = useState(''), [msg, setMsg] = useState('')
  const loadW = () => fetch('/api/widgets').then(r => r.json()).then(d => setWidgets(Array.isArray(d) ? d : []))
  useEffect(() => { const a = (d: any) => (Array.isArray(d) ? d : []); fetch('/api/metrics').then(r => r.json()).then(d => setMetrics(a(d))); fetch('/api/devices').then(r => r.json()).then(d => setDevices(a(d))); loadW() }, [])
  const tog = (p: string) => setSel(s => s.includes(p) ? s.filter(x => x !== p) : s.length < 5 ? [...s, p] : s)
  const ok = sel.length >= 3 && sel.length <= 5
  const save = async () => {
    const r = await fetch('/api/widgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title || 'Graphe', type, metrics: sel, deviceId: dev || null, range, norm }) })
    setMsg(r.ok ? 'Widget enregistré' : 'Erreur'); if (r.ok) { setTitle(''); loadW() }
  }
  const del = async (id: string) => { await fetch('/api/widgets/' + id, { method: 'DELETE' }); loadW() }
  return (
    <div className="grid">
      <div className="card">
        <h3>1. Paramètres (3 à 5)</h3>
        {metrics.map(m => <label key={m.id} className="ck"><input type="checkbox" checked={sel.includes(m.path)} onChange={() => tog(m.path)} />{m.label}{m.unit ? ` (${m.unit})` : ''}</label>)}
        {!metrics.length && <p className="mu">Aucun paramètre : ajoute-en dans Paramètres ou envoie un JSON.</p>}
        <h3 style={{ marginTop: 12 }}>2. Réglages</h3>
        <div className="frm">
          <select value={type} onChange={e => setType(e.target.value)}><option value="line">Courbe</option><option value="area">Aire</option><option value="bar">Barres</option></select>
          <select value={range} onChange={e => setRange(e.target.value)}><option>1h</option><option>24h</option><option>7d</option></select>
          <select value={dev} onChange={e => setDev(e.target.value)}><option value="">Tous les appareils</option>{devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          <label className="ck"><input type="checkbox" checked={norm} onChange={e => setNorm(e.target.checked)} />Normaliser 0–100 %</label>
        </div>
        <div className="frm"><input placeholder="Titre du graphe" value={title} onChange={e => setTitle(e.target.value)} /><button className="p" disabled={!ok} onClick={save}>Enregistrer</button><span className="mu">{ok ? msg : `Choisis 3 à 5 paramètres (${sel.length})`}</span></div>
      </div>
      <div className="card"><h3>Aperçu</h3>{ok ? <WidgetView cfg={{ type, metrics: sel, deviceId: dev || null, range, norm }} /> : <p className="mu">L’aperçu apparaît avec 3 à 5 paramètres.</p>}</div>
      <div className="card"><h3>Widgets enregistrés</h3>
        {widgets.map(w => <p key={w.id}>{w.title} <span className="mu">· {w.type} · {(w.metrics as string[]).length} param.</span> <button className="x" onClick={() => del(w.id)}>✕</button></p>)}
        {!widgets.length && <p className="mu">Aucun widget.</p>}</div>
    </div>
  )
}
