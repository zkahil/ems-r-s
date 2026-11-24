'use client'
import dynamic from 'next/dynamic'
// Leaflet a besoin du navigateur : pas de rendu serveur
export default dynamic(() => import('./MapView'), { ssr: false, loading: () => <p className="mu">Chargement de la carte…</p> })
