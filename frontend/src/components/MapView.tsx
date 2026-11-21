import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/** Mapa ligero con OpenStreetMap. Se carga solo cuando el usuario lo pide (ahorra datos). */
export default function MapView({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lon], 9)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 14, attribution: '© colaboradores de OpenStreetMap',
    }).addTo(map)
    L.circleMarker([lat, lon], { radius: 10, color: '#1E4A2C', fillColor: '#F3D98B', fillOpacity: 0.9, weight: 3 }).addTo(map).bindPopup(label)
    return () => { map.remove() }
  }, [lat, lon, label])
  return <div ref={ref} className="h-64 w-full overflow-hidden rounded-2xl border border-linea" role="img" aria-label={`Mapa de ${label}`} />
}
