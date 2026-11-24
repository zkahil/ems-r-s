'use client'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState('')
  const go = async () => {
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (r.ok) window.location.href = '/'; else setErr((await r.json().catch(() => ({}))).error || 'Erreur')
  }
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 12 }}>
      <div className="card" style={{ width: 320 }}>
        <h1 style={{ color: 'var(--ac)' }}>⚡ EMS</h1>
        <div className="frm" style={{ flexDirection: 'column' }}>
          <input style={{ width: '100%' }} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={{ width: '100%' }} type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} />
          <button className="p" onClick={go}>Se connecter</button>
          {err && <span className="er">{err}</span>}
        </div>
      </div>
    </div>
  )
}
