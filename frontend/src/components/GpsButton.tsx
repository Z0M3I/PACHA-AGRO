import { useState } from 'react'
import { api } from '../lib/api'
import { useApp, type Gps } from '../lib/store'

interface Located { municipality_id: string; municipality_name: string; department_name: string; distance_km: number; far: boolean; note: string | null }

const GEO_ERRORS: Record<number, string> = {
  1: 'No dio permiso para usar su ubicación. Puede elegir su municipio de la lista.',
  2: 'El celular no pudo saber dónde está. Pruebe al aire libre o elija su municipio de la lista.',
  3: 'Tardó demasiado en encontrar su ubicación. Intente otra vez o elija su municipio de la lista.',
}

/** «Usar mi ubicación»: clima del punto exacto y municipio registrado más cercano para el calendario. */
export function GpsButton({ onLocated }: { onLocated?: (g: Gps, info: Located) => void }) {
  const { setGps } = useApp()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  if (!('geolocation' in navigator)) return null
  const locate = () => {
    setBusy(true); setMsg(null)
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords
        const r = await api<Located>(`/api/locate?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`)
        const g = { lat, lon, municipalityId: r.municipality_id, distanceKm: r.distance_km, far: r.far }
        setGps(g)
        setMsg(r.note)
        onLocated?.(g, r)
      } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
    }, err => { setBusy(false); setMsg(GEO_ERRORS[err.code] ?? GEO_ERRORS[2]) }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 })
  }
  return (
    <div>
      <button type="button" onClick={locate} disabled={busy} data-testid="gps-button"
        className="min-h-14 w-full rounded-2xl border-2 border-bosque bg-brote-50 px-4 text-lg font-semibold text-bosque disabled:opacity-60">
        {busy ? 'Buscando su ubicación…' : '📍 Usar mi ubicación (GPS)'}
      </button>
      {msg && <p className="mt-2 text-sol-ink" role="status">{msg}</p>}
    </div>
  )
}
