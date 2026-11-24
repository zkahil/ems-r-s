'use client'
import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export type Cfg = { type: string; metrics: string[]; deviceId?: string | null; range?: string; norm?: boolean }
const COL = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']

export default function WidgetView({ cfg }: { cfg: Cfg }) {
  const [data, setData] = useState<any[]>([]), [meta, setMeta] = useState<Record<string, any>>({})
  const key = JSON.stringify([cfg.metrics, cfg.deviceId, cfg.range])
  useEffect(() => { fetch('/api/metrics').then(r => r.json()).then((m: any[]) => setMeta(Object.fromEntries((Array.isArray(m) ? m : []).map(x => [x.path, x])))) }, [])
  useEffect(() => {
    if (!cfg.metrics.length) { setData([]); return }
    const q = new URLSearchParams({ metrics: cfg.metrics.join(','), range: cfg.range || '24h' })
    if (cfg.deviceId) q.set('device', cfg.deviceId)
    fetch('/api/series?' + q).then(r => r.json()).then(d => setData(Array.isArray(d) ? d : []))
  }, [key])
  let rows = data
  if (cfg.norm) { // échelle 0–100 % par courbe (unités différentes)
    const mm = Object.fromEntries(cfg.metrics.map(m => { const v = data.map(d => d[m]).filter(x => x != null); return [m, [Math.min(...v), Math.max(...v)]] }))
    rows = data.map(d => { const o: any = { t: d.t }; cfg.metrics.forEach(m => { const [a, b] = mm[m]; o[m] = d[m] == null ? null : +(((d[m] - a) / ((b - a) || 1)) * 100).toFixed(1) }); return o })
  }
  if (!rows.length) return <p className="mu">Pas de données pour ces paramètres.</p>
  const C: any = cfg.type === 'bar' ? BarChart : cfg.type === 'area' ? AreaChart : LineChart
  const name = (m: string) => (meta[m]?.label || m) + (meta[m]?.unit && !cfg.norm ? ` (${meta[m].unit})` : '')
  const series = cfg.metrics.map((m, i) => {
    const p = { dataKey: m, name: name(m), stroke: COL[i], fill: COL[i], connectNulls: true }
    return cfg.type === 'bar' ? <Bar key={m} {...p} /> : cfg.type === 'area' ? <Area key={m} {...p} type="monotone" fillOpacity={0.18} dot={false} /> : <Line key={m} {...p} type="monotone" dot={false} strokeWidth={2} fill="none" />
  })
  return (
    <div style={{ height: 240 }}><ResponsiveContainer width="100%" height="100%">
      <C data={rows} margin={{ left: -18, right: 6, top: 4 }}>
        <CartesianGrid stroke="var(--bd)" vertical={false} />
        <XAxis dataKey="t" tickFormatter={(t: string) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} stroke="var(--mu)" fontSize={11} minTickGap={40} />
        <YAxis stroke="var(--mu)" fontSize={11} />
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--bd)', color: 'var(--tx)', fontSize: 12 }} labelFormatter={(t: any) => new Date(t).toLocaleString()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series}
      </C>
    </ResponsiveContainer></div>
  )
}
