import { useEffect, useState } from 'react'
import { HeroArt } from '../components/Logo'
import { api } from '../lib/api'
import { useApp } from '../lib/store'
import { round } from '../lib/format'
import type { Weather } from '../lib/types'

const ACTIONS = [
  { href: '#/sembrar', icon: '🌱', title: '¿Cuándo puedo sembrar?', text: 'Orientación según su lugar, cultivo y terreno.', cls: 'bg-bosque text-white', sub: 'text-brote' },
  { href: '#/clima', icon: '🌦️', title: '¿Cómo estará el clima?', text: 'Heladas, lluvias y temperaturas.', cls: 'bg-papel text-bosque border-2 border-bosque', sub: 'text-musgo' },
  { href: '#/comunidad', icon: '👨‍🌾', title: 'Mi comunidad', text: 'Reuniones, avisos y reportes.', cls: 'bg-tierra text-white', sub: 'text-tierra-100' },
  { href: '#/whatsapp', icon: '💬', title: 'Consultar por WhatsApp', text: 'Pregunte como en un chat.', cls: 'bg-papel text-tierra border-2 border-tierra', sub: 'text-musgo' },
]

export default function Home() {
  return (
    <div>
      <section className="relative -mx-4 -mt-4 mb-4 overflow-hidden bg-brote-50 px-4 pt-4">
        <h1 className="relative z-[1] max-w-[17rem] font-display text-[1.6rem] font-bold leading-[1.1] text-bosque min-[420px]:max-w-none">Tu campo, tu comunidad, mejores decisiones.</h1>
        <p className="relative z-[1] mt-1 text-[0.95rem] leading-snug text-musgo">Consulta el clima, planifica tus siembras y mantente conectado con tu comunidad.</p>
        <div className="-mb-1 mt-1 h-14 overflow-hidden min-[420px]:h-20"><HeroArt /></div>
      </section>

      <nav aria-label="Acciones principales" className="grid grid-cols-2 gap-3">
        {ACTIONS.map(a => (
          <a key={a.href} href={a.href} className={`flex min-h-28 flex-col justify-between gap-2 rounded-2xl p-3.5 ${a.cls}`}>
            <span className="text-[2.2rem] leading-none" aria-hidden="true">{a.icon}</span>
            <span>
              <span className="block text-[1.12rem] font-bold leading-tight">{a.title}</span>
              <span className={`mt-1 hidden text-[0.92rem] leading-snug min-[400px]:block [@media(min-height:800px)]:block ${a.sub}`}>{a.text}</span>
            </span>
          </a>
        ))}
      </nav>

      <a href="#/sembrar/demo" data-testid="demo-case"
        className="mt-3 flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-tierra bg-tierra-100 px-4 py-2.5 text-tierra">
        <span><span className="block text-lg font-bold leading-tight">▶ Probar con quinua en Challapata</span>
          <span className="text-sm">Ejemplo listo, sin cuenta ni formulario</span></span>
        <span className="shrink-0 rounded-full bg-papel px-2.5 py-0.5 text-sm font-bold">🧪 Caso simulado</span>
      </a>

      <QuickWeather />

      <a href="#/aprender" className="mt-4 flex items-center gap-4 rounded-2xl border border-linea bg-papel p-4">
        <span className="text-4xl" aria-hidden="true">📚</span>
        <span><span className="block text-xl font-bold text-bosque">Aprendamos sobre nuestro campo</span>
          <span className="text-musgo">Heladas, granizo, humedad del suelo y más. Lecciones de 2 minutos.</span></span>
      </a>
      <p className="mt-5 text-center text-sm text-musgo">Prototipo para hackatón. Las orientaciones no reemplazan a un técnico agrícola ni a los avisos oficiales del SENAMHI.</p>
    </div>
  )
}

function QuickWeather() {
  const { municipalityId, findMunicipality } = useApp()
  const m = findMunicipality(municipalityId)
  const [wx, setWx] = useState<Weather | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!m) return
    setWx(null); setFailed(false)
    api<Weather>(`/api/weather?municipality_id=${m.id}`).then(setWx).catch(() => setFailed(true))
  }, [m?.id])
  if (!m) return null
  const today = wx?.forecast.available ? wx.forecast.daily[0] : null
  const risk = wx?.frost_risk.level
  return (
    <a href="#/clima" className="mt-4 block rounded-2xl border border-linea bg-papel p-4">
      <div className="text-sm text-musgo">📍 {m.name}, {m.department_name}</div>
      {!wx && !failed && <div className="mt-1 text-musgo">Cargando clima…</div>}
      {failed && <div className="mt-1 text-musgo">No se pudo cargar el clima. Toque para reintentar.</div>}
      {wx && (today ? (
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="text-lg">Hoy: mín <strong>{round(today.tmin)}</strong> · máx <strong>{round(today.tmax)}</strong></span>
          <span className={`font-bold ${risk === 'alto' ? 'text-rojo' : risk === 'medio' ? 'text-sol-ink' : 'text-bosque'}`}>
            {risk === 'alto' ? '❄️ Helada fuerte' : risk === 'medio' ? '❄️ Helada posible' : '✅ Sin helada'} (7 días)
          </span>
        </div>
      ) : <div className="mt-1 text-sol-ink">Pronóstico no disponible ahora. Toque para ver más.</div>)}
    </a>
  )
}
