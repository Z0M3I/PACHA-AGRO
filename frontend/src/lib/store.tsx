import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from './api'
import type { Department, Municipality, User } from './types'

const LOC_KEY = 'agb_municipality'
const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* ignorar */ } }

interface Ctx {
  user: User | null
  setSession: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
  departments: Department[] | null
  locationsError: string | null
  reloadLocations: () => void
  municipalityId: string | null
  setMunicipalityId: (id: string) => void
  findMunicipality: (id: string | null) => (Municipality & { department_id: string; department_name: string }) | null
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [departments, setDepartments] = useState<Department[] | null>(null)
  const [locationsError, setLocationsError] = useState<string | null>(null)
  const [municipalityId, setMid] = useState<string | null>(read(LOC_KEY))

  const loadLocations = useCallback(() => {
    setLocationsError(null)
    api<{ departments: Department[] }>('/api/locations').then(d => setDepartments(d.departments)).catch(e => setLocationsError(e.message))
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getToken()) { setUser(null); return }
    try { setUser(await api<User>('/api/auth/me')) } catch { setUser(null) }
  }, [])

  useEffect(() => { loadLocations(); refreshUser() }, [loadLocations, refreshUser])

  const value = useMemo<Ctx>(() => ({
    user,
    setSession: (token, u) => {
      setToken(token); setUser(u)
      if (u.default_municipality_id && !read(LOC_KEY)) { setMid(u.default_municipality_id); write(LOC_KEY, u.default_municipality_id) }
    },
    logout: () => { setToken(null); setUser(null) },
    refreshUser,
    departments, locationsError, reloadLocations: loadLocations,
    municipalityId,
    setMunicipalityId: (id) => { setMid(id); write(LOC_KEY, id) },
    findMunicipality: (id) => {
      if (!id || !departments) return null
      for (const d of departments) {
        const m = d.municipalities.find(x => x.id === id)
        if (m) return { ...m, department_id: d.id, department_name: d.name }
      }
      return null
    },
  }), [user, departments, locationsError, municipalityId, refreshUser, loadLocations])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('AppProvider faltante')
  return c
}
