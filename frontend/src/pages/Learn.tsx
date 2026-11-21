import { useEffect, useState } from 'react'
import { Button, Card, ErrorBox, Loading, Notice, PageTitle } from '../components/ui'
import { api } from '../lib/api'
import { SimpleText } from '../components/SimpleText'
import { ArticleGrid } from '../components/ArticleCard'
import { ArticleCover } from '../components/ArticleCover'
import { lessonArticle, libraryArticle } from '../lib/articles'
import { useApp } from '../lib/store'
import type { Library } from '../lib/types'

interface Lesson { id: string; title: string; icon: string; minutes: number; points: string[]; quiz: { question: string; options: string[]; answer: number; explanation: string }; sources: string[] }
interface Content { language: string; review_status: string; review_note: string; lessons: Lesson[]; available_languages: { code: string; name: string; status: string; lessons: number }[] }

let cache: Content | null = null
function useContent(): [Content | null, string | null, () => void] {
  const [c, setC] = useState<Content | null>(cache)
  const [err, setErr] = useState<string | null>(null)
  const load = () => { setErr(null); api<Content>('/api/education?lang=es').then(d => { cache = d; setC(d) }).catch(e => setErr(e.message)) }
  useEffect(() => { if (!cache) load() }, [])
  return [c, err, load]
}

function Tabs({ current }: { current: 'lecciones' | 'biblioteca' }) {
  return (
    <nav aria-label="Secciones de aprendizaje" className="grid grid-cols-2 gap-2">
      {([['lecciones', '#/aprender', '🎓 Lecciones'], ['biblioteca', '#/aprender/biblioteca', '📚 Biblioteca']] as const).map(([k, href, l]) => (
        <a key={k} href={href} aria-current={current === k ? 'page' : undefined}
          className={`flex min-h-12 items-center justify-center rounded-xl border-2 font-semibold ${current === k ? 'border-bosque bg-bosque text-white' : 'border-linea bg-papel text-tinta'}`}>{l}</a>
      ))}
    </nav>
  )
}

export default function Learn({ lessonId, itemId }: { lessonId?: string; itemId?: string }) {
  if (lessonId === 'biblioteca') return <LibraryView itemId={itemId} />
  return <Lessons lessonId={lessonId} />
}

function Lessons({ lessonId }: { lessonId?: string }) {
  const [c, err, reload] = useContent()
  if (err) return <ErrorBox message={err} onRetry={reload} />
  if (!c) return <Loading />
  if (lessonId) {
    const l = c.lessons.find(x => x.id === lessonId)
    return l ? <LessonView l={l} next={c.lessons[c.lessons.indexOf(l) + 1]} /> : <ErrorBox message="Lección no encontrada." />
  }
  return (
    <div className="space-y-4">
      <PageTitle icon="📚" title="Aprendamos sobre nuestro campo" subtitle="Lecciones cortas con una pregunta al final." />
      <Tabs current="lecciones" />
      <ArticleGrid items={c.lessons.map(lessonArticle)} />
      <Card>
        <h2 className="font-bold">🗣️ Idiomas</h2>
        <ul className="mt-1">{c.available_languages.map(x => <li key={x.code}>{x.name}: {x.status === 'pendiente' ? 'en preparación (requiere revisión lingüística)' : `${x.lessons} lecciones`}</li>)}</ul>
      </Card>
      <Notice tone="warn">{c.review_note}</Notice>
    </div>
  )
}

function LessonView({ l, next }: { l: Lesson; next?: Lesson }) {
  const [pick, setPick] = useState<number | null>(null)
  useEffect(() => setPick(null), [l.id])
  return (
    <article className="space-y-4">
      <a href="#/aprender" className="inline-block min-h-10 font-semibold text-bosque underline">← Todas las lecciones</a>
      {(() => { const a = lessonArticle(l); return <ArticleCover motif={a.motif} band={a.band} bandColor={a.bandColor} /> })()}
      <h1 className="font-display text-[1.7rem] font-bold leading-tight text-bosque">{l.title}</h1>
      <ol className="space-y-3">
        {l.points.map((p, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border border-linea bg-papel p-4 text-lg">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bosque font-bold text-white">{i + 1}</span><span>{p}</span>
          </li>
        ))}
      </ol>
      <section className="rounded-2xl border-2 border-ocre bg-sol-50 p-4">
        <h2 className="text-xl font-bold text-sol-ink">❓ Pregunta</h2>
        <p className="mt-1 text-lg">{l.quiz.question}</p>
        <div className="mt-3 grid gap-2">
          {l.quiz.options.map((o, i) => {
            const state = pick === null ? '' : i === l.quiz.answer ? 'border-bosque bg-brote' : i === pick ? 'border-rojo bg-rojo-50' : 'opacity-60'
            return <button key={o} disabled={pick !== null} onClick={() => setPick(i)} className={`min-h-14 rounded-xl border-2 border-linea bg-papel px-4 text-left text-lg font-semibold ${state}`}>{o}</button>
          })}
        </div>
        {pick !== null && <p className="mt-3 text-lg" role="status"><strong>{pick === l.quiz.answer ? '✅ ¡Correcto!' : '❌ No exactamente.'}</strong> {l.quiz.explanation}</p>}
      </section>
      {next && <a href={`#/aprender/${next.id}`} className="flex min-h-14 items-center justify-center rounded-xl bg-bosque text-lg font-semibold text-white">Siguiente: {next.title} →</a>}
      {!next && <Button variant="secondary" className="w-full" onClick={() => { window.location.hash = '/sembrar' }}>🌱 Probar: ¿cuándo puedo sembrar?</Button>}
      <p className="text-sm text-musgo"><strong>Fuentes:</strong> {l.sources.join(' · ')}</p>
    </article>
  )
}

let libCache: Library | null = null

function LibraryView({ itemId }: { itemId?: string }) {
  const { departments, user } = useApp()
  const [lib, setLib] = useState<Library | null>(libCache)
  const [err, setErr] = useState<string | null>(null)
  const [crop, setCrop] = useState<string>(user?.crops[0] ?? '')
  const [type, setType] = useState('')
  const [dept, setDept] = useState('')
  const load = () => { setErr(null); api<Library>('/api/education/library').then(d => { libCache = d; setLib(d) }).catch(e => setErr(e.message)) }
  useEffect(() => { if (!libCache) load() }, [])
  if (err) return <ErrorBox message={err} onRetry={load} />
  if (!lib) return <Loading />

  if (itemId) {
    const it = lib.items.find(i => i.id === itemId)
    if (!it) return <ErrorBox message="Recurso no encontrado." />
    return (
      <article className="space-y-4">
        <a href="#/aprender/biblioteca" className="inline-block min-h-10 font-semibold text-bosque underline">← Biblioteca</a>
        {(() => { const a = libraryArticle(it, lib.types); return <ArticleCover motif={a.motif} band={a.band} bandColor={a.bandColor} /> })()}
        <p className="text-sm font-bold uppercase tracking-wide text-tierra">{lib.types[it.type]} · {it.reading_minutes} min</p>
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-bosque">{it.title}</h1>
        <p className="text-lg text-musgo">{it.summary}</p>
        <SimpleText text={it.body} />
        <Notice tone="warn"><strong>Fuente:</strong> {it.source_note} {lib.note}</Notice>
      </article>
    )
  }

  const items = lib.items.filter(i => (!crop || i.crop === null || i.crop === crop) && (!type || i.type === type) && (!dept || i.department_id === null || i.department_id === dept))
  const sel = 'min-h-12 w-full rounded-xl border-2 border-linea bg-white px-3 text-lg'
  return (
    <div className="space-y-4">
      <PageTitle icon="📚" title="Biblioteca" subtitle="Guías y fichas cortas. Filtre por su cultivo o su zona." />
      <Tabs current="biblioteca" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <label className="block"><span className="mb-1 block font-semibold">Cultivo</span>
          <select className={sel} value={crop} onChange={e => setCrop(e.target.value)}>
            <option value="">Todos</option><option value="quinua">Quinua</option><option value="papa">Papa</option><option value="maiz">Maíz</option><option value="haba">Haba</option><option value="cebada">Cebada</option>
          </select></label>
        <label className="block"><span className="mb-1 block font-semibold">Tipo</span>
          <select className={sel} value={type} onChange={e => setType(e.target.value)}>
            <option value="">Todos</option>{Object.entries(lib.types).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></label>
        <label className="col-span-2 block md:col-span-1"><span className="mb-1 block font-semibold">Departamento</span>
          <select className={sel} value={dept} onChange={e => setDept(e.target.value)}>
            <option value="">Todo el país</option>{departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select></label>
      </div>
      <p className="text-musgo" role="status">{items.length} de {lib.total} recursos</p>
      {items.length === 0 ? <Notice>No hay recursos con esos filtros.</Notice> : (
        <ArticleGrid items={items.map(i => libraryArticle(i, lib.types))} showSummary />
      )}
      <Notice tone="warn">{lib.note}</Notice>
      <p className="text-sm text-musgo">{lib.source_project}</p>
    </div>
  )
}
