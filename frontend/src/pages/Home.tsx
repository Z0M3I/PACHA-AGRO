import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useApp } from '../lib/store'
import { round } from '../lib/format'
import type { Library, Weather } from '../lib/types'
import { ArticleGrid } from '../components/ArticleCard'
import { lessonArticle, libraryArticle, recommended, type Article } from '../lib/articles'

const sections = [
  { href: '#/sembrar/comparar', title: 'Comparar suelos', text: 'Vea cómo cambia la orientación si varía la humedad del terreno.' },
  { href: '#/comunidad', title: 'Comunidad', text: 'Consulte avisos, participe en reuniones y registre observaciones del campo.' },
  { href: '#/aprender', title: 'Guías de campo', text: 'Aprenda a interpretar heladas, lluvias y humedad del suelo.' },
  { href: '#/avisos', title: 'Avisos para el campo', text: 'Avisos de la plataforma por zona o cultivo. No son avisos oficiales.' },
]

export default function Home() {
  const { user } = useApp()
  const [articles, setArticles] = useState<Article[] | null>(null)
  useEffect(() => {
    Promise.all([api<{ lessons: any[] }>('/api/education?lang=es'), api<Library>('/api/education/library')])
      .then(([les, lib]) => setArticles(recommended(
        les.lessons.map(lessonArticle),
        lib.items.map(i => ({ ...libraryArticle(i, lib.types), crop: i.crop })),
        user?.crops ?? [])))
      .catch(() => setArticles([]))
  }, [user?.crops.join(',')])
  return (
    <>
      <h1 className="mag-tagline">Tu campo, tu comunidad, mejores decisiones.</h1>
      <p className="mag-sub">Consulta el clima, planifica tus siembras y mantente conectado con tu comunidad.</p>

      <div className="mag-tools">
        <section className="mag-tool-main">
          <div>
            <h2>¿Cuándo puedo sembrar?</h2>
            <p className="mag-tool-desc mt-2">Revise heladas, lluvia, humedad y la época de siembra de su zona. Sin registrarse.</p>
          </div>
          <a href="#/sembrar">Consultar condiciones de siembra</a>
        </section>
        <QuickWeather />
      </div>

      <h2 className="mag-heading">Artículos recomendados</h2>
      {articles === null ? <p className="text-musgo" role="status">Cargando artículos…</p>
        : articles.length === 0 ? <p className="text-musgo">No se pudieron cargar los artículos. <a className="site-text-link" href="#/aprender">Ir a Aprender</a></p>
        : <ArticleGrid items={articles} />}
      <p className="mt-4"><a className="site-text-link" href="#/aprender/biblioteca">Ver todos los artículos →</a></p>

      <h2 className="mag-heading">Más herramientas</h2>
      <nav className="home-sections" aria-label="Herramientas y recursos">
        {sections.map(section => (
          <a key={section.href} href={section.href}>
            <h3 className="font-bold text-[#173b2a]">{section.title}</h3>
            <p>{section.text}</p>
          </a>
        ))}
      </nav>
      <p className="site-note">La orientación de siembra usa reglas experimentales pendientes de validación agronómica.</p>
      <nav className="home-legal" aria-label="Información">
        <a className="site-text-link" href="#/cobertura">Cobertura nacional</a>
        <a className="site-text-link" href="#/privacidad">Privacidad</a>
        <a className="site-text-link" href="#/terminos">Términos</a>
      </nav>
    </>
  )
}

function QuickWeather() {
  const { municipalityId, findMunicipality, locationQuery, gps } = useApp()
  const municipality = findMunicipality(municipalityId)
  const [weather, setWeather] = useState<{ id: string; value: Weather | null }>()
  const id = municipality?.id
  useEffect(() => {
    if (!id) return
    let current = true
    api<Weather>(`/api/weather?${locationQuery(id)}`, { timeoutMs: 65000 })
      .then(value => { if (current) setWeather({ id, value }) })
      .catch(() => { if (current) setWeather({ id, value: null }) })
    return () => { current = false }
  }, [id, gps?.lat, gps?.lon])
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
