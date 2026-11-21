import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useApp } from '../lib/store'
import { round } from '../lib/format'
import type { Weather } from '../lib/types'

const sections = [
  { href: '#/sembrar/comparar', title: 'Comparar suelos', text: 'Vea cómo cambia la orientación si varía la humedad del terreno.' },
  { href: '#/comunidad', title: 'Comunidad', text: 'Consulte avisos, participe en reuniones y registre observaciones del campo.' },
  { href: '#/aprender', title: 'Guías de campo', text: 'Aprenda a interpretar heladas, lluvias y humedad del suelo.' },
]

export default function Home() {
  return (
    <>
      <div className="home-grid">
        <section className="home-intro">
          <h1>Siembra y clima<br />en Bolivia</h1>
          <p>Consulte el pronóstico de su municipio y revise las condiciones para sembrar quinua en el Altiplano.</p>
          <a className="site-primary" href="#/sembrar">Consultar condiciones de siembra</a>
        </section>
        <QuickWeather />
      </div>
      <nav className="home-sections" aria-label="Herramientas y recursos">
        {sections.map(section => (
          <a key={section.href} href={section.href}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </a>
        ))}
      </nav>
      <p className="site-note">La orientación de siembra usa reglas experimentales pendientes de validación agronómica.</p>
    </>
  )
}

function QuickWeather() {
  const { municipalityId, findMunicipality } = useApp()
  const municipality = findMunicipality(municipalityId)
  const [weather, setWeather] = useState<{ id: string; value: Weather | null }>()
  const id = municipality?.id
  useEffect(() => {
    if (!id) return
    let current = true
    api<Weather>(`/api/weather?municipality_id=${encodeURIComponent(id)}`, { timeoutMs: 65000 })
      .then(value => { if (current) setWeather({ id, value }) })
      .catch(() => { if (current) setWeather({ id, value: null }) })
    return () => { current = false }
  }, [id])
  const current = weather?.id === id ? weather?.value : undefined
  const today = current?.forecast.available ? current.forecast.daily[0] : undefined
  return (
    <section className="home-weather">
      <h2>Pronóstico local</h2>
      {municipality ? <p>{municipality.name}, {municipality.department_name}</p> : <p>Elija un municipio para consultar lluvia, temperatura y riesgo de helada.</p>}
      {municipality && (today ? (
        <div className="home-temperatures">
          <div><strong>{round(today.tmin)}</strong><span>Mínima</span></div>
          <div><strong>{round(today.tmax)}</strong><span>Máxima</span></div>
        </div>
      ) : <p role="status">{current === undefined ? 'Consultando la fuente meteorológica…' : 'Pronóstico no disponible en este momento.'}</p>)}
      {today && <p className="site-note">{current?.forecast.source}</p>}
      <a className="site-text-link" href="#/clima">{municipality ? 'Ver pronóstico completo' : 'Elegir municipio'}</a>
    </section>
  )
}
