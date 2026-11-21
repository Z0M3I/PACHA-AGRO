import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Department } from '../lib/types'

const COLOR: Record<string, string> = { altiplano: '#7A4E2D', valles: '#B87A2A', llanos: '#2C6640' }

/** Mapa de cobertura nacional (idea de PACHAAGRO). Se carga solo cuando se pide. */
export default function CoverageMap({ departments }: { departments: Department[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([-16.7, -64.7], 5)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© colaboradores de OpenStreetMap' }).addTo(map)
    for (const d of departments) for (const m of d.municipalities) {
      L.circleMarker([m.lat, m.lon], { radius: 7, color: '#1f2620', weight: 1, fillColor: COLOR[m.region] ?? '#999', fillOpacity: 0.9 })
        .addTo(map).bindPopup(`<strong>${m.name}</strong><br>${d.name} · ${m.region}`)
    }
    return () => { map.remove() }
  }, [departments])
  return <div ref={ref} className="h-80 w-full overflow-hidden rounded-2xl border border-linea" role="img" aria-label="Mapa de municipios de Bolivia con datos en AgroBolivia" />
}
