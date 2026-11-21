import { useState, type FormEvent } from 'react'
import { Button, Field, Notice, PageTitle, inputCls } from '../components/ui'
import { api, ApiError } from '../lib/api'
import { go } from '../lib/router'
import { useApp } from '../lib/store'
import type { User } from '../lib/types'

export function Login() {
  const { setSession } = useApp()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      const r = await api<{ token: string; user: User }>('/api/auth/login', { body: { phone, password } })
      setSession(r.token, r.user); go('/comunidad')
    } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <PageTitle icon="🔑" title="Ingresar" subtitle="Solo necesita cuenta para su comunidad. El clima y la siembra son libres." />
      <Field label="Número de celular"><input className={inputCls} inputMode="tel" autoComplete="tel" placeholder="71234567" value={phone} onChange={e => setPhone(e.target.value)} required /></Field>
      <Field label="Clave"><input className={inputCls} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></Field>
      {err && <p role="alert" className="font-semibold text-rojo">⚠️ {err}</p>}
      <Button className="w-full" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</Button>
      <a href="#/registro" className="block min-h-12 py-3 text-center text-lg font-semibold text-bosque underline underline-offset-4">¿No tiene cuenta? Regístrese</a>
      <Notice tone="sim">
        <p className="font-bold">Cuentas de DEMOSTRACIÓN (ficticias)</p>
        <p>Representante: <strong>70000001</strong> · Agricultora: <strong>70000002</strong> · Clave: <strong>demo1234</strong></p>
      </Notice>
    </form>
  )
}

export function Register() {
  const { setSession, municipalityId } = useApp()
  const [f, setF] = useState({ full_name: '', phone: '', password: '', whatsapp_opt_in: false })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null); setErrs({})
    try {
      const r = await api<{ token: string; user: User }>('/api/auth/register', { body: { ...f, default_municipality_id: municipalityId } })
      setSession(r.token, r.user); go('/comunidad')
    } catch (e) {
      if (e instanceof ApiError) { setErrs(e.fields); setErr(e.message) } else setErr('Ocurrió un problema.')
    } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <PageTitle icon="📝" title="Crear cuenta" subtitle="Para unirse a su comunidad y recibir avisos." />
      <Field label="Nombre completo" error={errs.full_name}><input className={inputCls} autoComplete="name" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} /></Field>
      <Field label="Número de celular" error={errs.phone} hint="8 dígitos, por ejemplo 71234567"><input className={inputCls} inputMode="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
      <Field label="Clave (mínimo 6 letras o números)" error={errs.password}><input className={inputCls} type="password" autoComplete="new-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></Field>
      <label className="flex min-h-12 items-start gap-3 rounded-xl border-2 border-linea bg-papel p-3">
        <input type="checkbox" className="mt-1 h-6 w-6 accent-[#1e4a2c]" checked={f.whatsapp_opt_in} onChange={e => setF({ ...f, whatsapp_opt_in: e.target.checked })} />
        <span><strong>Acepto recibir por WhatsApp</strong> recordatorios de reuniones y avisos de mi comunidad. Puedo darme de baja cuando quiera escribiendo BAJA.</span>
      </label>
      <p className="text-sm text-musgo">Usamos su número solo para su cuenta y avisos de su comunidad. Los demás miembros no ven su número completo. Lea la <a className="font-semibold text-bosque underline" href="#/privacidad">política de privacidad</a>.</p>
      {err && <p role="alert" className="font-semibold text-rojo">⚠️ {err}</p>}
      <Button className="w-full" disabled={busy}>{busy ? 'Creando…' : 'Crear cuenta'}</Button>
      <a href="#/ingresar" className="block min-h-12 py-3 text-center text-lg font-semibold text-bosque underline underline-offset-4">Ya tengo cuenta</a>
    </form>
  )
}

export function Profile() {
  const { user, logout, refreshUser } = useApp()
  const [busy, setBusy] = useState(false)
  if (!user) return <Login />
  const toggle = async () => {
    setBusy(true)
    try { await api('/api/auth/me', { method: 'PATCH', body: { whatsapp_opt_in: !user.whatsapp_opt_in } }); await refreshUser() } finally { setBusy(false) }
  }
  return (
    <div className="space-y-4">
      <PageTitle icon="👤" title={user.full_name} subtitle={`Celular terminado en ${user.phone.slice(-4)}`} />
      {user.is_demo && <Notice tone="sim">Esta es una cuenta de DEMOSTRACIÓN ficticia.</Notice>}
      <div className="rounded-2xl border border-linea bg-papel p-4">
        <p className="text-lg font-bold">💬 Avisos por WhatsApp</p>
        <p className="mt-1">{user.whatsapp_opt_in ? 'Usted aceptó recibir recordatorios y avisos.' : 'No recibe recordatorios ni avisos.'}</p>
        <Button variant="secondary" className="mt-3" disabled={busy} onClick={toggle}>{user.whatsapp_opt_in ? 'Dejar de recibir' : 'Aceptar recibir avisos'}</Button>
      </div>
      <CropInterests />
      {(user.role === 'admin' || user.role === 'editor') && <a href="#/admin" className="block rounded-xl bg-tierra px-5 py-3 text-center text-lg font-semibold text-white">🛠️ {user.role === 'admin' ? 'Panel de administración' : 'Publicar avisos'}</a>}
      <Button variant="danger" className="w-full" onClick={() => { logout(); go('/') }}>Salir de mi cuenta</Button>
    </div>
  )
}

const CROPS = [['quinua', '🌾 Quinua'], ['papa', '🥔 Papa'], ['maiz', '🌽 Maíz'], ['haba', '🫘 Haba'], ['cebada', '🌾 Cebada']] as const

/** Cultivos de interés (idea de PACHAAGRO): segmentan los avisos regionales que recibe. */
function CropInterests() {
  const { user, refreshUser } = useApp()
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  if (!user) return null
  const toggle = async (id: string) => {
    setBusy(true); setSaved(false)
    const next = user.crops.includes(id) ? user.crops.filter(c => c !== id) : [...user.crops, id]
    try { await api('/api/auth/me', { method: 'PATCH', body: { crops: next } }); await refreshUser(); setSaved(true) } finally { setBusy(false) }
  }
  return (
    <div className="rounded-2xl border border-linea bg-papel p-4">
      <p className="text-lg font-bold">🌾 Mis cultivos</p>
      <p className="mt-1 text-musgo">Recibirá los avisos de estos cultivos además de los de su zona.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {CROPS.map(([id, label]) => {
          const on = user.crops.includes(id)
          return <button key={id} disabled={busy} aria-pressed={on} onClick={() => toggle(id)}
            className={`min-h-12 rounded-xl border-2 text-lg font-semibold ${on ? 'border-bosque bg-brote text-bosque-800' : 'border-linea bg-papel'}`}>{on ? '✔ ' : ''}{label}</button>
        })}
      </div>
      {saved && <p className="mt-2 font-semibold text-bosque" role="status">✅ Guardado</p>}
    </div>
  )
}
