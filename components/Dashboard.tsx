'use client'
import { useEffect, useState } from 'react'
import WidgetView from './WidgetView'

export default function Dashboard() {
  const [ws, setWs] = useState<any[]>([])
  useEffect(() => { fetch('/api/widgets').then(r => r.json()).then(d => setWs(Array.isArray(d) ? d : [])) }, [])
  return (<>
    <div className="grid">{ws.map(w => <div className="card" key={w.id}><h3>{w.title}</h3><WidgetView cfg={w} /></div>)}</div>
    {!ws.length && <p className="mu">Aucun graphe. L’admin les crée dans « Studio graphes ».</p>}</>)
}
