import type { Motif } from '../components/ArticleCover'
import type { LibraryItem } from './types'

export interface Article { id: string; href: string; title: string; summary: string; kicker: string; band: string; bandColor: string; motif: Motif }

// Colores de franja (texto blanco con contraste ≥ 4.5:1)
const C = { clima: '#24435f', siembra: '#2c6640', suelo: '#7a4e2d', riesgo: '#a63a2b', cosecha: '#7d5418' }

const LESSON: Record<string, { band: string; color: string; motif: Motif }> = {
  forecast: { band: 'Clima', color: C.clima, motif: 'forecast' },
  frost: { band: 'Heladas', color: C.clima, motif: 'frost' },
  hail: { band: 'Granizo', color: C.clima, motif: 'hail' },
  seed: { band: 'Siembra', color: C.siembra, motif: 'seed' },
  soil: { band: 'Suelo', color: C.suelo, motif: 'soil' },
  field: { band: 'Terreno', color: C.suelo, motif: 'field' },
  shield: { band: 'Riesgos', color: C.riesgo, motif: 'shield' },
}

const LIB: Record<string, { band: string; color: string; motif: Motif }> = {
  guia: { band: 'Guía', color: C.siembra, motif: 'seed' },
  calendario: { band: 'Calendario', color: C.suelo, motif: 'calendar' },
  cultivo: { band: 'Cultivos', color: C.siembra, motif: 'seed' },
  suelo: { band: 'Suelo', color: C.suelo, motif: 'soil' },
  plagas: { band: 'Plagas', color: C.riesgo, motif: 'pest' },
  buenas_practicas: { band: 'Cosecha', color: C.cosecha, motif: 'coffee' },
  cuidados: { band: 'Riego', color: C.cosecha, motif: 'water' },
}
const CROP_MOTIF: Record<string, Motif> = { papa: 'potato', quinua: 'quinoa', maiz: 'corn' }

export function lessonArticle(l: { id: string; title: string; icon: string; minutes: number; points: string[] }): Article {
  const m = LESSON[l.icon] ?? LESSON.seed
  return { id: `l-${l.id}`, href: `#/aprender/${l.id}`, title: l.title, summary: l.points[0] ?? '', kicker: `Lección · ${l.minutes} min`,
    band: m.band, bandColor: m.color, motif: m.motif }
}

export function libraryArticle(i: LibraryItem, types: Record<string, string>): Article {
  const m = LIB[i.type] ?? LIB.guia
  return { id: `b-${i.id}`, href: `#/aprender/biblioteca/${i.id}`, title: i.title, summary: i.summary,
    kicker: `Biblioteca · ${types[i.type] ?? i.type} · ${i.reading_minutes} min`, band: m.band, bandColor: m.color,
    motif: (i.crop && CROP_MOTIF[i.crop]) || m.motif }
}

/** Mezcla lecciones y guías (primero las de los cultivos de la persona). */
export function recommended(lessons: Article[], library: (Article & { crop?: string | null })[], crops: string[], n = 6): Article[] {
  const lib = [...library].sort((a, b) => Number(crops.includes(b.crop ?? '')) - Number(crops.includes(a.crop ?? '')))
  const out: Article[] = []
  for (let i = 0; out.length < n && (i < lessons.length || i < lib.length); i++) {
    if (lib[i]) out.push(lib[i])
    if (lessons[i] && out.length < n) out.push(lessons[i])
  }
  return out
}
