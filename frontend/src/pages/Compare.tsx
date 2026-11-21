import { useState } from 'react'
import { LocationSelector } from '../components/LocationPicker'
import { useApp } from '../lib/store'
import { DataTag, STATUS_UI, StatusMark } from '../components/ui'
import { api } from '../lib/api'
import type { Criterion, Recommendation } from '../lib/types'

const moistureOptions = [
  { value: 'si', label: 'Húmedo' },
  { value: 'poca', label: 'Poca humedad' },
  { value: 'no', label: 'Seco' },
] as const

type Moisture = typeof moistureOptions[number]['value']

function Condition({ criterion }: { criterion?: Criterion }) {
  if (!criterion) return <span>Sin datos</span>
  return (
    <div className="compare-condition">
      <span className="inline-flex items-center gap-2"><StatusMark status={criterion.status} />{STATUS_UI[criterion.status].label}</span>
      <p>{criterion.explanation}</p>
      <DataTag kind={criterion.data_kind} />
      {criterion.source && <small>{criterion.source}</small>}
    </div>
  )
}

export default function Compare() {
  const { municipalityId, setMunicipalityId } = useApp()
  const [irrigation, setIrrigation] = useState('secano')
  const [left, setLeft] = useState<Moisture>('si')
  const [right, setRight] = useState<Moisture>('no')
  const [comparison, setComparison] = useState<{ results: [Recommendation, Recommendation]; labels: [string, string] }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const labelFor = (value: Moisture) => moistureOptions.find(option => option.value === value)?.label ?? value

  async function compare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!municipalityId || left === right || loading) return
    setLoading(true)
    setError('')
    setComparison(undefined)
    const run = (soil_moisture: Moisture) => api<Recommendation>('/api/recommendations', {
      timeoutMs: 65000,
      body: { municipality_id: municipalityId, crop: 'quinua', soil_moisture, irrigation, mode: 'real' },
    })
    try {
      const results: [Recommendation, Recommendation] = [await run(left), await run(right)]
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
    <section className="compare">
      <header className="compare-intro">
        <h1>Comparar condiciones de siembra</h1>
        <p>Elija un municipio y compare dos niveles de humedad para quinua. La consulta usa las fuentes meteorológicas disponibles para ese lugar.</p>
      </header>
      <fieldset disabled={loading}>
        <LocationSelector value={municipalityId} onChange={id => { setMunicipalityId(id); setComparison(undefined); setError('') }} />
      </fieldset>
      <form className="compare-form" onSubmit={compare}>
        <label>Disponibilidad de agua
          <select value={irrigation} onChange={event => { setIrrigation(event.target.value); setComparison(undefined) }} disabled={loading}>
            <option value="secano">Depende de la lluvia</option>
            <option value="riego">Tiene riego</option>
          </select>
        </label>
        <label>Escenario A
          <select value={left} onChange={event => { setLeft(event.target.value as Moisture); setComparison(undefined) }} disabled={loading}>
            {moistureOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>Escenario B
          <select value={right} onChange={event => { setRight(event.target.value as Moisture); setComparison(undefined) }} disabled={loading}>
            {moistureOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button type="submit" disabled={loading || left === right || !municipalityId}>{loading ? 'Comparando…' : 'Comparar escenarios'}</button>
      </form>
      {left === right && <p className="site-note">Elige niveles de humedad distintos para comparar.</p>}
      {error && <p className="compare-error" role="alert">{error}</p>}
      {comparison && first && second && (
        <section className="compare-output" aria-label="Resultado de la comparación" aria-live="polite">
          <p className="site-note">{first.location.name}, {first.location.department_name} · {first.crop_name}</p>
          {(!first.weather_summary?.forecast_available || !second.weather_summary?.forecast_available) && (
            <p role="status" className="compare-notice">Falta pronóstico en al menos una consulta. Revise qué datos están disponibles en cada escenario.</p>
          )}
          <div className="compare-result-grid">
            {comparison.results.map((result, index) => (
              <article key={index} className={`compare-result ${STATUS_UI[result.status].ink}`}>
                <p>Escenario {index === 0 ? 'A' : 'B'} · {comparison.labels[index]}</p>
                <h2>{result.headline}</h2>
                <p>{result.summary}</p>
                {result.actions[0] && <p className="compare-action">{result.actions[0]}</p>}
              </article>
            ))}
          </div>
          {first.criteria.length > 0 && <>
            <h2>¿Qué cambió?</h2>
            <p>{changed.length ? changed.map(criterion => criterion.label).join(', ') : 'Los criterios conservaron sus niveles.'}
              {first.status === second.status ? ' El resultado general se mantiene.' : ' El resultado general también cambia.'}
            </p>
            <div className="compare-table">
              <table>
                <thead><tr><th scope="col">Criterio</th><th scope="col">A · {comparison.labels[0]}</th><th scope="col">B · {comparison.labels[1]}</th></tr></thead>
                <tbody>
                  {first.criteria.map(criterion => (
                    <tr key={criterion.id} className={changed.includes(criterion) ? 'compare-changed' : undefined}>
                      <th scope="row">{criterion.label}{changed.includes(criterion) && <small>Cambió de nivel</small>}</th>
                      <td><Condition criterion={criterion} /></td>
                      <td><Condition criterion={second.criteria.find(item => item.id === criterion.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}
        </section>
      )}
      <p className="site-note">Orientación experimental. Las reglas están pendientes de validación agronómica.</p>
    </section>
  )
}
