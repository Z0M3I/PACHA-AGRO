import { lazy, Suspense } from 'react'
import { BottomNav } from './components/BottomNav'
import { LogoMark } from './components/Logo'
import { Loading } from './components/ui'
import { useRoute } from './lib/router'
import { useApp } from './lib/store'
import Home from './pages/Home'
import Sow from './pages/Sow'

const Compare = lazy(() => import('./pages/Compare'))
const Weather = lazy(() => import('./pages/Weather'))
const CommunityHome = lazy(() => import('./pages/Community'))
const CommunityDetail = lazy(() => import('./pages/CommunityDetail'))
const WhatsApp = lazy(() => import('./pages/WhatsApp'))
const Learn = lazy(() => import('./pages/Learn'))
const Admin = lazy(() => import('./pages/Admin'))
const Notices = lazy(() => import('./pages/Notices'))
const Coverage = lazy(() => import('./pages/Coverage'))
const Legal = lazy(() => import('./pages/Legal'))
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/Auth').then(m => ({ default: m.Register })))
const Profile = lazy(() => import('./pages/Auth').then(m => ({ default: m.Profile })))

function Page({ parts }: { parts: string[] }) {
  const [a, b, c] = parts
  switch (a) {
    case undefined: return <Home />
    case 'escritorio':
    case 'sembrar': return (
      <>
        <nav className="section-nav" aria-label="Herramientas de siembra">
          <a href="#/sembrar" aria-current={a === 'sembrar' && !b ? 'page' : undefined}>Consulta de siembra</a>
          <a href="#/sembrar/comparar" aria-current={a === 'escritorio' || b === 'comparar' ? 'page' : undefined}>Comparar condiciones</a>
        </nav>
        {a === 'escritorio' || b === 'comparar' ? <Compare /> : <Sow />}
      </>
    )
    case 'clima': return <Weather />
    case 'comunidad': return b && /^\d+$/.test(b) ? <CommunityDetail id={Number(b)} /> : <CommunityHome />
    case 'whatsapp': return <WhatsApp />
    case 'aprender': return <Learn lessonId={b} itemId={c} />
    case 'avisos': return <Notices />
    case 'cobertura': return <Coverage />
    case 'privacidad': return <Legal doc="privacidad" />
    case 'terminos': return <Legal doc="terminos" />
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
  const section = parts[0] ?? ''
  // Avisos se abre desde Clima; cobertura y páginas legales no tienen pestaña propia.
  const nav = section === 'escritorio' ? 'sembrar' : section === 'avisos' ? 'clima' : section
  const wide = ['', 'clima', 'escritorio'].includes(section) || parts[1] === 'comparar'
  return (
    <div className="min-h-screen pb-nav">
      <a href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-30 focus:bg-papel focus:p-2">Ir al contenido</a>
      <header className="site-header">
        <div className="site-header-inner">
          <a href="#/" className="flex items-center gap-2" aria-label="AgroBolivia, inicio">
            <LogoMark size={36} /><span className="font-display text-xl font-bold text-bosque">AgroBolivia</span>
          </a>
          <BottomNav current={nav} desktop />
          <a href={user ? '#/perfil' : '#/ingresar'} className="flex min-h-12 items-center rounded-full border-2 border-linea px-3 font-semibold text-bosque">
            {user ? `${user.full_name.split(' ')[0]}` : 'Ingresar'}
          </a>
        </div>
      </header>
      <main id="main" tabIndex={-1} className={`site-main ${wide ? 'site-main-wide' : ''}`}>
        <Suspense fallback={<Loading />}><Page parts={parts} /></Suspense>
      </main>
      <BottomNav current={nav} />
    </div>
  )
}
