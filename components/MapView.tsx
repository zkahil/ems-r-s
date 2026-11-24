'use client'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet'

type D = { id: string; name: string; serial: string; lastSeen: string | null }
export type S = { id: string; name: string; address: string | null; lat: number | null; lng: number | null; devices: D[] }
const ON = 10 * 60 * 1000 // en ligne = donnée reçue il y a moins de 10 min

function Click({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

export default function MapView({ sites, canEdit }: { sites: S[]; canEdit: boolean }) {
  const router = useRouter(), [pl, setPl] = useState(''), [err, setErr] = useState('')
  const now = Date.now()
  const online = (s: S) => s.devices.filter(d => d.lastSeen && now - +new Date(d.lastSeen) < ON).length
  const color = (s: S) => (!s.devices.length ? '#9ca3af' : online(s) ? '#22c55e' : '#ef4444')
  const placed = sites.filter(s => s.lat != null && s.lng != null)
  const center: [number, number] = placed.length ? [placed[0].lat!, placed[0].lng!] : [31.8, -7.1]
  const pick = async (lat: number, lng: number) => {
    if (!pl) return
    const r = await fetch('/api/sites/' + pl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) }) })
    if (r.ok) { setPl(''); setErr(''); router.refresh() } else setErr('Placement refusé')
  }
  return (
    <>
      <div className="frm" style={{ alignItems: 'center' }}>
        <span><span style={{ color: '#22c55e' }}>●</span> en ligne &nbsp;<span style={{ color: '#ef4444' }}>●</span> hors ligne &nbsp;<span style={{ color: '#9ca3af' }}>●</span> sans appareil</span>
        {canEdit && <>
          <select value={pl} onChange={e => setPl(e.target.value)}><option value="">Placer / déplacer un site…</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}{s.lat != null ? ' ✓' : ''}</option>)}</select>
          {pl && <span className="mu">→ clique sur la carte pour fixer la position</span>}
        </>}
        {err && <span className="er">{err}</span>}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={placed.length ? 8 : 6} style={{ height: 460, cursor: pl ? 'crosshair' : undefined }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          <Click onPick={pick} />
          {placed.map(s => (
            <CircleMarker key={s.id} center={[s.lat!, s.lng!]} radius={11} pathOptions={{ color: color(s), fillColor: color(s), fillOpacity: 0.6 }}>
              <Popup>
                <b>{s.name}</b><br />{s.address}<br />
                {s.devices.length ? s.devices.map(d => <div key={d.id}>{d.name} · {d.serial} · {d.lastSeen && now - +new Date(d.lastSeen) < ON ? 'en ligne' : 'hors ligne'}</div>) : 'Aucun appareil'}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="card tw" style={{ marginTop: 12 }}><table>
        <thead><tr><th>Site</th><th>Position</th><th>Appareils</th><th>En ligne</th></tr></thead>
        <tbody>{sites.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.lat != null ? `${s.lat}, ${s.lng}` : <span className="mu">non placé</span>}</td><td>{s.devices.length}</td><td>{online(s)}</td></tr>)}
          {!sites.length && <tr><td colSpan={4} className="mu">Aucun site. Crée-en dans « Sites ».</td></tr>}</tbody>
      </table></div>
    </>
  )
}
