import { useEffect, useState } from 'react'
import { Button, Card, ErrorBox, Loading, Notice, PageTitle } from '../components/ui'
import { api } from '../lib/api'
import { useApp } from '../lib/store'
import type { Community } from '../lib/types'

export default function Admin() {
  const { user } = useApp()
  const [pending, setPending] = useState<(Community & { requested_by: string })[] | null>(null)
  const [approved, setApproved] = useState<Community[] | null>(null)
  const [users, setUsers] = useState<any[] | null>(null)
  const [report, setReport] = useState<Record<string, any> | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [members, setMembers] = useState<{ cid: number; list: any[] } | null>(null)
  const load = () => {
    setErr(null)
    Promise.all([api('/api/admin/communities?status=pending'), api('/api/admin/communities?status=approved'), api('/api/admin/users'), api('/api/admin/reports')])
      .then(([p, a, u, r]) => { setPending(p); setApproved(a); setUsers(u); setReport(r) }).catch(e => setErr(e.message))
  }
  useEffect(() => { if (user?.role === 'admin') load() }, [user])
  if (!user || user.role !== 'admin') return <ErrorBox message="Solo para administradores." />
  const decide = async (id: number, d: string) => { await api(`/api/admin/communities/${id}/${d}`, { method: 'POST' }); load() }
  const showMembers = async (cid: number) => setMembers({ cid, list: await api(`/api/admin/memberships?community_id=${cid}`) })
  const setRole = async (mid: number, role: string) => { await api(`/api/admin/memberships/${mid}/role`, { body: { role } }); if (members) showMembers(members.cid) }
  const deactivate = async (uid: number) => { if (window.confirm('¿Desactivar esta cuenta?')) { await api(`/api/admin/users/${uid}/deactivate`, { method: 'POST' }); load() } }
  if (err) return <ErrorBox message={err} onRetry={load} />
  if (!pending || !users || !report || !approved) return <Loading />
  return (
    <div className="space-y-5">
      <PageTitle icon="🛠️" title="Administración" subtitle="Comunidades, permisos y reportes." />
      <section>
        <h2 className="mb-2 text-xl font-bold">Comunidades por aprobar ({pending.length})</h2>
        {pending.length === 0 ? <Notice>No hay solicitudes.</Notice> : pending.map(c => (
          <Card key={c.id} className="mb-2">
            <div className="text-lg font-bold">{c.name}</div>
            <div className="text-musgo">{c.municipality_name}, {c.department_name} · Solicita: {c.requested_by}</div>
            {c.description && <p>{c.description}</p>}
            <p className="mt-1 text-sm">Al aprobar, el solicitante queda como representante.</p>
            <div className="mt-2 grid grid-cols-2 gap-2"><Button onClick={() => decide(c.id, 'approve')}>Aprobar</Button><Button variant="danger" onClick={() => decide(c.id, 'reject')}>Rechazar</Button></div>
          </Card>
        ))}
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold">Comunidades activas</h2>
        {approved.map(c => (
          <Card key={c.id} className="mb-2">
            <div className="flex items-center justify-between gap-2"><div><div className="font-bold">{c.name}</div><div className="text-sm text-musgo">{c.municipality_name} · {c.members} miembros</div></div>
              <Button variant="secondary" onClick={() => showMembers(c.id)}>Permisos</Button></div>
            {members?.cid === c.id && <ul className="mt-2 space-y-2">{members.list.map(m => (
              <li key={m.id} className="flex items-center justify-between gap-2 border-t border-linea pt-2">
                <span>{m.user_name} · <em>{m.role === 'representative' ? 'Representante' : 'Miembro'}</em> · {m.status}</span>
                {m.status === 'approved' && <Button variant="ghost" onClick={() => setRole(m.id, m.role === 'representative' ? 'member' : 'representative')}>{m.role === 'representative' ? 'Quitar rol' : 'Hacer representante'}</Button>}
              </li>))}</ul>}
          </Card>
        ))}
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold">Reporte del sistema</h2>
        <Card><ul className="grid grid-cols-2 gap-2">
          {Object.entries(report).filter(([k]) => !k.startsWith('_') && typeof report[k] === 'number').map(([k, v]) => <li key={k}><div className="text-2xl font-bold text-bosque">{v as number}</div><div className="text-sm text-musgo">{k.replace(/_/g, ' ')}</div></li>)}
        </ul><p className="mt-2 text-sm text-musgo">{report._nota}</p></Card>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold">Usuarios ({users.length})</h2>
        <ul className="space-y-2">{users.map(u => (
          <li key={u.id} className="flex items-center justify-between gap-2 rounded-xl border border-linea bg-papel p-3">
            <span>{u.full_name} <span className="text-sm text-musgo">· …{u.phone_last4} · {u.role}{u.is_demo ? ' · demo' : ''}{!u.is_active ? ' · inactivo' : ''}</span></span>
            {u.is_active && u.role !== 'admin' && <Button variant="ghost" onClick={() => deactivate(u.id)}>Desactivar</Button>}
          </li>))}</ul>
      </section>
    </div>
  )
}
