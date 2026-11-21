const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function dayLabel(iso: string, today = new Date()): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.round((date.getTime() - t0.getTime()) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  return `${DIAS[date.getDay()]} ${d}`
}

export function dateLong(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function updatedAt(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })
}

export type WeatherIconName = 'sun' | 'cloudSun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm'

export function weatherIcon(code: number | null, storm = false): { icon: WeatherIconName | null; text: string } {
  if (storm || (code !== null && code >= 95)) return { icon: 'storm', text: 'Tormenta' }
  if (code === null) return { icon: null, text: 'Sin dato' }
  if (code === 0) return { icon: 'sun', text: 'Despejado' }
  if (code <= 2) return { icon: 'cloudSun', text: 'Algo nublado' }
  if (code === 3) return { icon: 'cloud', text: 'Nublado' }
  if (code <= 48) return { icon: 'fog', text: 'Niebla' }
  if (code <= 67) return { icon: 'rain', text: 'Lluvia' }
  if (code <= 77) return { icon: 'snow', text: 'Nieve' }
  if (code <= 82) return { icon: 'rain', text: 'Chubascos' }
  return { icon: 'snow', text: 'Nieve' }
}

export const round = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `${Math.round(n)}°`)
