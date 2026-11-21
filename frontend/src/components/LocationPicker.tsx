import { useState } from 'react'
import { useApp } from '../lib/store'
import { ErrorBox, Loading } from './ui'

/** Selección en dos pasos con botones grandes: departamento → municipio. */
export function DepartmentList({ onPick, selected }: { onPick: (id: string) => void; selected?: string | null }) {
  const { departments, locationsError, reloadLocations } = useApp()
  if (locationsError) return <ErrorBox message={locationsError} onRetry={reloadLocations} />
  if (!departments) return <Loading />
  return (
    <div className="grid grid-cols-2 gap-3">
      {departments.map(d => (
        <OptionButton key={d.id} selected={selected === d.id} onClick={() => onPick(d.id)}>{d.name}</OptionButton>
      ))}
    </div>
  )
}

export function MunicipalityList({ departmentId, onPick, selected }: { departmentId: string; onPick: (id: string) => void; selected?: string | null }) {
  const { departments } = useApp()
  const d = departments?.find(x => x.id === departmentId)
  if (!d) return <Loading />
  return (
    <div className="grid gap-3">
      {d.municipalities.map(m => (
        <OptionButton key={m.id} selected={selected === m.id} onClick={() => onPick(m.id)}>
          <span>{m.name}</span>
          <span className="block text-base font-normal text-musgo">≈ {m.elevation.toLocaleString('es-BO')} m de altura</span>
        </OptionButton>
      ))}
      <p className="text-musgo">¿No está su municipio? Elija el más cercano. Pronto agregaremos más.</p>
    </div>
  )
}

export function OptionButton({ children, onClick, selected }: { children: React.ReactNode; onClick: () => void; selected?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={`min-h-16 w-full rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition-colors ${selected ? 'border-bosque bg-brote text-bosque-800' : 'border-linea bg-papel hover:border-bosque-600 hover:bg-brote-50'}`}>
      {children}
    </button>
  )
}

/** Selector compacto reutilizable (Clima, Perfil). */
export function LocationSelector({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  const { findMunicipality } = useApp()
  const current = findMunicipality(value)
  const [open, setOpen] = useState(!current)
  const [dept, setDept] = useState<string | null>(current?.department_id ?? null)
  if (!open && current) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-linea bg-papel px-4 py-3">
        <div>
          <div className="text-sm text-musgo">📍 Ubicación</div>
          <div className="text-lg font-bold">{current.name}, {current.department_name}</div>
        </div>
        <button className="min-h-12 rounded-xl px-3 font-semibold text-bosque underline underline-offset-4" onClick={() => setOpen(true)}>Cambiar</button>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border-2 border-bosque bg-papel p-4">
      {!dept ? (
        <><h2 className="mb-3 text-xl font-bold">¿En qué departamento está?</h2><DepartmentList onPick={setDept} /></>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">¿En qué municipio?</h2>
            <button className="min-h-12 px-2 font-semibold text-bosque underline" onClick={() => setDept(null)}>← Departamento</button></div>
          <MunicipalityList departmentId={dept} selected={value} onPick={id => { onChange(id); setOpen(false) }} />
        </>
      )}
    </div>
  )
}
