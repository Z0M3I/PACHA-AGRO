import { useState } from 'react'
import { LogoMark } from '../components/Logo'
import { DataTag, STATUS_UI } from '../components/ui'
import { api } from '../lib/api'
import type { Criterion, Recommendation } from '../lib/types'
import './desktop.css'

const moistureOptions = [
  { value: 'si', label: 'Húmedo' },
  { value: 'poca', label: 'Poca humedad' },
  { value: 'no', label: 'Seco' },
] as const

type Moisture = typeof moistureOptions[number]['value']

function Condition({ criterion }: { criterion?: Criterion }) {
  if (!criterion) return <span>Sin datos</span>
  return (
    <div className="desktop-condition">
      <span><span aria-hidden="true">{STATUS_UI[criterion.status].emoji} </span>{STATUS_UI[criterion.status].label}</span>
      <p>{criterion.explanation}</p>
      <DataTag kind={criterion.data_kind} />
      {criterion.source && <small>{criterion.source}</small>}
    </div>
  )
}

export default function Desktop() {
  const [left, setLeft] = useState<Moisture>('si')
  const [right, setRight] = useState<Moisture>('no')
  const [comparison, setComparison] = useState<{ results: [Recommendation, Recommendation]; labels: [string, string] }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const labelFor = (value: Moisture) => moistureOptions.find(option => option.value === value)?.label ?? value

  async function compare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setComparison(undefined)
    const run = (soil_moisture: Moisture) => api<Recommendation>('/api/recommendations', {
      body: { municipality_id: 'or-challapata', crop: 'quinua', soil_moisture, irrigation: 'secano', mode: 'simulado' },
    })
    try {
      const results = await Promise.all([run(left), run(right)])
      setComparison({ results, labels: [labelFor(left), labelFor(right)] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la comparación.')
    } finally {
      setLoading(false)
    }
  }

  const first = comparison?.results[0]
  const second = comparison?.results[1]
  const changed = first?.criteria.filter(criterion => {
    const other = second?.criteria.find(item => item.id === criterion.id)
    return other && other.status !== criterion.status
  }) ?? []

  return (
    <div className="desktop-shell">
      <aside className="desktop-sidebar">
        <a className="desktop-brand" href="#/"><LogoMark size={38} /> AgroBolivia</a>
        <nav aria-label="Navegación de escritorio">
          <a href="#/escritorio" aria-current="page">Comparar escenarios</a>
          <a href="#/sembrar">Asistente de siembra</a>
          <a href="#/clima">Clima</a>
          <a href="#/comunidad">Comunidad</a>
          <a href="#/aprender">Aprender</a>
        </nav>
      </aside>
      <main className="desktop-main">
        <header className="desktop-header">
          <p>Oruro / Challapata</p>
          <span>Caso simulado</span>
        </header>
        <div className="desktop-intro">
          <h1>¿Qué cambia si el suelo está seco?</h1>
          <p>Compara la siembra de quinua con dos niveles de humedad. El clima simulado y el riego de secano son los mismos en ambos escenarios.</p>
        </div>
        <form className="desktop-form" onSubmit={compare}>
          <label>Escenario A
            <select value={left} onChange={event => setLeft(event.target.value as Moisture)} disabled={loading}>
              {moistureOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>Escenario B
            <select value={right} onChange={event => setRight(event.target.value as Moisture)} disabled={loading}>
              {moistureOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <button type="submit" disabled={loading || left === right}>{loading ? 'Comparando…' : 'Comparar escenarios'}</button>
        </form>
        {left === right && <p className="desktop-note">Elige niveles de humedad distintos para comparar.</p>}
        {error && <p className="desktop-error" role="alert">{error}</p>}
        {comparison && first && second && (
          <section className="desktop-output" aria-label="Resultado de la comparación" aria-live="polite">
            <div className="desktop-result-grid">
              {comparison.results.map((result, index) => (
                <article key={index} className={`desktop-result ${STATUS_UI[result.status].box}`}>
                  <p>Escenario {index === 0 ? 'A' : 'B'} · {comparison.labels[index]}</p>
                  <h2>{STATUS_UI[result.status].emoji} {result.headline}</h2>
                  <p>{result.summary}</p>
                  {result.actions[0] && <p className="desktop-action">{result.actions[0]}</p>}
                </article>
              ))}
            </div>
            <h2>¿Qué cambió?</h2>
            <p>{changed.length ? changed.map(criterion => criterion.label).join(', ') : 'Los criterios conservaron sus niveles.'}
              {first.status === second.status ? ' El resultado general se mantiene.' : ' El resultado general también cambia.'}
            </p>
            <div className="desktop-table">
              <table>
                <thead><tr><th scope="col">Criterio</th><th scope="col">A · {comparison.labels[0]}</th><th scope="col">B · {comparison.labels[1]}</th></tr></thead>
                <tbody>
                  {first.criteria.map(criterion => (
                    <tr key={criterion.id} className={changed.includes(criterion) ? 'desktop-changed' : undefined}>
                      <th scope="row">{criterion.label}{changed.includes(criterion) && <small>Cambió de nivel</small>}</th>
                      <td><Condition criterion={criterion} /></td>
                      <td><Condition criterion={second.criteria.find(item => item.id === criterion.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <p className="desktop-note">Orientación experimental. Las reglas están pendientes de validación agronómica.</p>
      </main>
    </div>
  )
}
