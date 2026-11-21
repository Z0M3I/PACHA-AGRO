import { useEffect, useState } from 'react'
import { Card, ErrorBox, Loading, Notice, PageTitle } from '../components/ui'
import { api } from '../lib/api'
import { dateLong } from '../lib/format'
import { useApp } from '../lib/store'
import type { RegionalNotice } from '../lib/types'


/** Avisos regionales segmentados (adaptado de PACHAAGRO). Públicos, sin cuenta. */
export default function Notices() {
  const { municipalityId, findMunicipality, user } = useApp()
  const m = findMunicipality(municipalityId)
  const [scope, setScope] = useState<'zona' | 'todos'>('zona')
  const [list, setList] = useState<RegionalNotice[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const waitingLocation = scope === 'zona' && !!municipalityId && !m  // la lista de municipios aún no cargó
  const load = () => {
    if (waitingLocation) return
    setList(null); setErr(null)
    const q = scope === 'todos' ? '' : user ? `?mine=true${m ? `&municipality_id=${m.id}` : ''}` : m ? `?municipality_id=${m.id}` : ''
    // Sin ubicación ni cuenta, "Mi zona" solo puede mostrar los avisos nacionales.
    const onlyNational = scope === 'zona' && !m && !user
    api<RegionalNotice[]>(`/api/notices${q}`).then(r => setList(onlyNational ? r.filter(n => n.scope === 'nacional') : r)).catch(e => setErr(e.message))
  }
  useEffect(load, [scope, m?.id, user?.id, user?.crops.join(','), waitingLocation])

  return (
    <div className="space-y-4">
      <PageTitle title="Avisos para el campo" subtitle="Avisos de la plataforma por departamento, municipio o cultivo." />
      <Notice tone="warn">Son avisos de <strong>AgroBolivia</strong>, no avisos oficiales. Los avisos oficiales los publica el SENAMHI.</Notice>
      <div role="tablist" className="grid grid-cols-2 gap-2">
        {([['zona', `${m ? m.name : 'Mi zona'}`], ['todos', 'Todos']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={scope === k} onClick={() => setScope(k)}
            className={`min-h-12 rounded-md border font-semibold ${scope === k ? 'border-bosque bg-bosque text-white' : 'border-linea bg-white'}`}>{l}</button>
        ))}
      </div>
      {scope === 'zona' && !m && !user && <Notice>Elija su ubicación en <a className="font-semibold text-bosque underline" href="#/clima">Clima</a> para ver los avisos de su zona.</Notice>}
      {scope === 'zona' && user && user.crops.length === 0 && <Notice>Marque sus cultivos en <a className="font-semibold text-bosque underline" href="#/perfil">Mi cuenta</a> para recibir también avisos por cultivo.</Notice>}
      {err ? <ErrorBox message={err} onRetry={load} /> : !list ? <Loading /> : list.length === 0 ? <Notice>No hay avisos vigentes.</Notice> : (
        <ul className="space-y-3">
          {list.map(n => (
            <li key={n.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="rounded-sm border border-bosque-600/40 px-2 py-0.5 text-[.72rem] uppercase tracking-[.08em] text-bosque-800">{n.kind_label}</span>
                  <span className="rounded-full bg-tierra-100 px-2.5 py-0.5 text-tierra">Para: {n.scope_label}</span>
                  {n.is_demo && <span className="rounded-full bg-sol px-2.5 py-0.5 text-sol-ink">DEMO · ejemplo</span>}
                </div>
                <h2 className="mt-2 text-xl font-bold">{n.title}</h2>
                <p className="mt-1 text-lg">{n.summary}</p>
                {n.body && <p className="mt-1 whitespace-pre-line">{n.body}</p>}
                <p className="mt-2 text-sm text-musgo">
                  {n.author ? `${n.author} · ${n.author_role} · ` : ''}{dateLong(n.created_at)}{n.expires_at ? ` · Vigente hasta ${dateLong(n.expires_at)}` : ''}
                </p>
                <p className="text-sm text-musgo">{n.disclaimer}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
