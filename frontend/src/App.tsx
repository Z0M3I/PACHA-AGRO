import { lazy, Suspense } from 'react'
import { BottomNav } from './components/BottomNav'
import { LogoMark } from './components/Logo'
import { Loading } from './components/ui'
import { useRoute } from './lib/router'
import { useApp } from './lib/store'
import Home from './pages/Home'
import Sow from './pages/Sow'

const Desktop = lazy(() => import('./pages/Desktop'))
const Weather = lazy(() => import('./pages/Weather'))
const CommunityHome = lazy(() => import('./pages/Community'))
const CommunityDetail = lazy(() => import('./pages/CommunityDetail'))
const WhatsApp = lazy(() => import('./pages/WhatsApp'))
const Learn = lazy(() => import('./pages/Learn'))
const Admin = lazy(() => import('./pages/Admin'))
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/Auth').then(m => ({ default: m.Register })))
const Profile = lazy(() => import('./pages/Auth').then(m => ({ default: m.Profile })))

function Page({ parts }: { parts: string[] }) {
  const [a, b] = parts
  switch (a) {
    case undefined: return <Home />
    case 'sembrar': return <Sow />
    case 'clima': return <Weather />
    case 'comunidad': return b && /^\d+$/.test(b) ? <CommunityDetail id={Number(b)} /> : <CommunityHome />
    case 'whatsapp': return <WhatsApp />
    case 'aprender': return <Learn lessonId={b} />
    case 'ingresar': return <Auth />
    case 'registro': return <Register />
    case 'perfil': return <Profile />
    case 'admin': return <Admin />
    default: return <div className="py-10 text-center"><p className="text-xl">Esta página no existe.</p><a className="mt-3 inline-block font-semibold text-bosque underline" href="#/">Volver al inicio</a></div>
  }
}

export default function App() {
  const parts = useRoute()
  const { user } = useApp()
  if (parts[0] === 'escritorio') return <Suspense fallback={<Loading />}><Desktop /></Suspense>
  const nav = ['', 'sembrar', 'clima', 'comunidad', 'aprender'].includes(parts[0] ?? '') ? (parts[0] ?? '') : parts[0] === 'whatsapp' ? '' : 'comunidad'
  return (
    <div className="min-h-screen pb-nav">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-30 focus:bg-papel focus:p-2">Ir al contenido</a>
      <header className="sticky top-0 z-10 bg-papel/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-2">
          <a href="#/" className="flex items-center gap-2" aria-label="AgroBolivia, inicio">
            <LogoMark size={36} /><span className="font-display text-xl font-bold text-bosque">AgroBolivia</span>
          </a>
          <a href="#/escritorio" className="hidden font-semibold text-bosque underline lg:inline">Escritorio</a>
          <a href={user ? '#/perfil' : '#/ingresar'} className="flex min-h-12 items-center rounded-full border-2 border-linea px-3 font-semibold text-bosque">
            {user ? `👤 ${user.full_name.split(' ')[0]}` : 'Ingresar'}
          </a>
        </div>
        <div className="aguayo" aria-hidden="true" />
      </header>
      <main id="main" className="mx-auto max-w-xl px-4 pt-4">
        <Suspense fallback={<Loading />}><Page parts={parts} /></Suspense>
      </main>
      <BottomNav current={nav} />
    </div>
  )
}
