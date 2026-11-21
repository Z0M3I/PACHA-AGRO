import { useEffect, useState } from 'react'
import { LessonArt } from '../components/Illustrations'
import { Button, Card, ErrorBox, Loading, Notice, PageTitle } from '../components/ui'
import { api } from '../lib/api'

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

export default function Learn({ lessonId }: { lessonId?: string }) {
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
      <ul className="grid gap-3">
        {c.lessons.map(l => (
          <li key={l.id}><a href={`#/aprender/${l.id}`} className="flex items-center gap-4 rounded-2xl border border-linea bg-papel p-3">
            <LessonArt icon={l.icon} /><span><span className="block text-xl font-bold text-bosque">{l.title}</span><span className="text-musgo">{l.minutes} minutos</span></span>
          </a></li>
        ))}
      </ul>
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
      <div className="flex items-center gap-4"><LessonArt icon={l.icon} size={80} /><h1 className="font-display text-[1.7rem] font-bold leading-tight text-bosque">{l.title}</h1></div>
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
