import { useEffect, useState } from 'react'
import { DepartmentList, MunicipalityList, OptionButton } from '../components/LocationPicker'
import { Button, Card, DataTag, ErrorBox, Loading, Notice, PageTitle, STATUS_UI } from '../components/ui'
import { api } from '../lib/api'
import { useApp } from '../lib/store'
import type { Crop, Recommendation } from '../lib/types'

type Answers = { dept?: string; muni?: string; crop?: string; variety?: string; moisture?: string; irrigation?: string }
const STEPS = ['dept', 'muni', 'crop', 'variety', 'moisture', 'irrigation'] as const

export default function Sow() {
  const { findMunicipality, municipalityId, setMunicipalityId } = useApp()
  const saved = findMunicipality(municipalityId)
  const [a, setA] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [crops, setCrops] = useState<Crop[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)

  const loadCrops = () => { setErr(null); api<{ crops: Crop[] }>('/api/crops').then(d => setCrops(d.crops)).catch(e => setErr(e.message)) }
  useEffect(loadCrops, [])

  const set = (k: keyof Answers, v: string) => { setA(p => ({ ...p, [k]: v })); setStep(s => s + 1) }
  const useSaved = () => { if (saved) { setA({ dept: saved.department_id, muni: saved.id }); setStep(2) } }

  const submit = async (irrigation: string) => {
    const ans = { ...a, irrigation }
    setA(ans); setLoading(true); setErr(null)
    try {
      const r = await api<Recommendation>('/api/recommendations', { timeoutMs: 65000, body: {
        municipality_id: ans.muni, crop: ans.crop, variety: ans.variety === 'Otra / no sé' ? null : ans.variety,
        soil_moisture: ans.moisture, irrigation: ans.irrigation, mode: 'real' } })
      setResult(r)
      if (ans.muni) setMunicipalityId(ans.muni)
    } catch (e) { setErr((e as Error).message) } finally { setLoading(false) }
  }

  const restart = () => { setA({}); setStep(0); setResult(null) }

  if (loading) return <><PageTitle icon="🌱" title="¿Cuándo puedo sembrar?" /><Loading text="Revisando clima y calendario…" /></>
  if (result) return <Result r={result} onRestart={restart} />

  const crop = crops?.find(c => c.id === a.crop)
  const muni = findMunicipality(a.muni ?? null)
  const key = STEPS[step]

  return (
    <div>
      <PageTitle icon="🌱" title="¿Cuándo puedo sembrar?" subtitle="Responda 6 preguntas cortas." />
      <div className="mb-4" aria-label={`Paso ${step + 1} de 6`}>
        <div className="flex gap-1.5" aria-hidden="true">{STEPS.map((_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-bosque' : 'bg-linea'}`} />)}</div>
        <div className="mt-1 flex justify-between text-musgo"><span>Paso {step + 1} de 6</span>
          {step > 0 && <button className="min-h-10 font-semibold text-bosque underline underline-offset-4" onClick={() => setStep(s => s - 1)}>← Atrás</button>}</div>
      </div>
      {err && <div className="mb-4"><ErrorBox message={err} onRetry={crops ? undefined : loadCrops} /></div>}

      {key === 'dept' && (<>
        <Q n={1} text="¿En qué departamento está?" />
        {saved && <div className="mb-3"><OptionButton onClick={useSaved}>📍 Usar {saved.name}, {saved.department_name}</OptionButton></div>}
        <DepartmentList selected={a.dept} onPick={v => set('dept', v)} />
      </>)}
      {key === 'muni' && a.dept && (<><Q n={2} text="¿En qué municipio o comunidad?" /><MunicipalityList departmentId={a.dept} selected={a.muni} onPick={v => set('muni', v)} /></>)}
      {key === 'crop' && (<>
        <Q n={3} text="¿Qué cultivo quiere sembrar?" />
        {!crops ? <Loading /> : (
          <div className="grid grid-cols-2 gap-3">
            {crops.map(c => {
              const st = muni ? c.regions[muni.region] : undefined
              return (
                <OptionButton key={c.id} selected={a.crop === c.id} onClick={() => set('crop', c.id)}>
                  <span className="text-3xl" aria-hidden="true">{c.emoji}</span><span className="block">{c.name}</span>
                  <span className="block text-sm font-normal text-musgo">{st === 'implemented' ? 'Disponible' : st === 'demo' ? 'Reglas preliminares' : 'Sin reglas aún'}</span>
                </OptionButton>
              )
            })}
          </div>
        )}
      </>)}
      {key === 'variety' && crop && (<><Q n={4} text={`¿Qué variedad de ${crop.name.toLowerCase()} va a usar?`} />
        <div className="grid gap-3">{crop.varieties.map(v => <OptionButton key={v} selected={a.variety === v} onClick={() => set('variety', v)}>{v}</OptionButton>)}</div></>)}
      {key === 'moisture' && (<><Q n={5} text="¿Su terreno tiene humedad suficiente?" />
        <p className="mb-3 text-musgo">Prueba: apriete tierra de 5-10 cm de hondo. Si forma un terrón, hay humedad.</p>
        <div className="grid gap-3">
          <OptionButton onClick={() => set('moisture', 'si')}>💧 Sí, está húmedo</OptionButton>
          <OptionButton onClick={() => set('moisture', 'poca')}>💧 Un poco</OptionButton>
          <OptionButton onClick={() => set('moisture', 'no')}>🏜️ No, está seco</OptionButton>
          <OptionButton onClick={() => set('moisture', 'no_se')}>❔ No sé</OptionButton>
        </div></>)}
      {key === 'irrigation' && (<><Q n={6} text="¿Tiene riego o depende de la lluvia?" />
        <div className="grid gap-3">
          <OptionButton onClick={() => submit('riego')}>🚿 Tengo riego</OptionButton>
          <OptionButton onClick={() => submit('secano')}>🌧️ Depende de la lluvia</OptionButton>
        </div></>)}
    </div>
  )
}

function Q({ n, text }: { n: number; text: string }) {
  return <h2 className="mb-3 text-[1.4rem] font-bold leading-snug"><span className="sr-only">Pregunta {n}: </span>{text}</h2>
}

function Result({ r, onRestart }: { r: Recommendation; onRestart: () => void }) {
  const ui = STATUS_UI[r.status]
  const share = encodeURIComponent(`AgroBolivia — ${r.crop_name} en ${r.location.name}: ${ui.emoji} ${r.headline}. ${r.summary} (Orientación experimental, consulte a su técnico.)`)
  const noForecast = r.weather_summary && !r.weather_summary.forecast_available && r.mode === 'real'
  return (
    <div className="space-y-4">
      <PageTitle icon="🌱" title={`${r.crop_name} en ${r.location.name}`} subtitle={`${r.location.department_name}${r.variety ? ` · ${r.variety}` : ''}`} />
      {r.scenario_status === 'demo' && <Notice tone="warn"><strong>Reglas preliminares.</strong> {r.scenario_label}</Notice>}

      <section aria-live="polite" className={`rounded-2xl border-2 p-5 ${ui.box}`}>
        <div className={`flex items-center gap-3 text-[1.6rem] font-bold leading-tight ${ui.ink}`}><span className="text-4xl" aria-hidden="true">{ui.emoji}</span>{r.headline}</div>
        <p className="mt-2 text-lg">{r.summary}</p>
        {r.status !== 'gris' && <p className="mt-2 text-sm text-musgo">Disponibilidad de datos: <strong>{r.confidence}</strong>. Las reglas son experimentales y requieren validación agronómica.</p>}
      </section>

      {noForecast && (
        <Notice tone="warn">
          <strong>Sin pronóstico ahora.</strong> {r.weather_summary?.forecast_error} {r.weather_summary?.recent_source ? 'La consulta incluye datos históricos disponibles.' : 'Revise los criterios que tienen datos disponibles.'}
        </Notice>
      )}

      {r.criteria.length > 0 && (
        <section>
          <h2 className="mb-2 text-xl font-bold">¿Por qué?</h2>
          <ul className="space-y-2">
            {r.criteria.map(c => (
              <li key={c.id} className="rounded-xl border border-linea bg-papel p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-lg font-bold">{STATUS_UI[c.status].emoji} {c.label}</span><DataTag kind={c.data_kind} />
                </div>
                <p className="mt-1">{c.explanation}</p>
                {c.source && <p className="mt-1 text-sm text-musgo">Fuente: {c.source}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Card>
        <h2 className="mb-2 text-xl font-bold">¿Qué puede hacer?</h2>
        <ul className="list-disc space-y-1 pl-5">{r.actions.map(x => <li key={x}>{x}</li>)}</ul>
      </Card>

      <div className="grid gap-3">
        <a className="flex min-h-12 items-center justify-center rounded-xl bg-[#1f7a4a] px-5 text-lg font-semibold text-white" href={`https://wa.me/?text=${share}`} target="_blank" rel="noopener noreferrer">💬 Compartir por WhatsApp</a>
        <Button variant="secondary" onClick={onRestart}>Hacer otra consulta</Button>
      </div>

      <details className="rounded-xl border border-linea bg-papel p-3">
        <summary className="cursor-pointer text-lg font-semibold text-bosque">Detalles técnicos y fuentes</summary>
        <div className="mt-2 space-y-2 text-base">
          <p>{r.disclaimer}</p>
          {r.score !== null && <p>Puntaje experimental ponderado: <strong>{r.score}</strong> (no es una probabilidad).</p>}
          {r.variety_note && <p>{r.variety_note}</p>}
          {r.notes.map(n => <p key={n}>• {n}</p>)}
          {r.sources.length > 0 && <><p className="font-semibold">Referencias:</p><ul className="list-disc pl-5">{r.sources.map(s => <li key={s}>{s}</li>)}</ul></>}
        </div>
      </details>
    </div>
  )
}
