import { describe, expect, it } from 'vitest'
import { shareText, whatsappShareUrl } from './share'
import type { Recommendation } from './types'

const base = {
  status: 'rojo', headline: 'Condiciones desfavorables', summary: '', score: 0.4, confidence: 'baja',
  crop_name: 'Quinua', variety: 'Pandela', location: { name: 'Challapata', department_name: 'Oruro', region: 'altiplano' },
  scenario_status: 'implemented', scenario_label: '', disclaimer: '', criteria: [], actions: [], sources: [], notes: [],
  key_factor: { id: 'helada', label: 'Riesgo de helada (7 días)', status: 'rojo', explanation: '', data_kind: 'simulado', source: null, value: null },
  main_action: 'Espere: no siembre hasta que pasen los días con helada fuerte.', missing_data: [], confidence_explanation: '',
} as const

const make = (mode: string) => ({ ...base, mode }) as unknown as Recommendation

describe('mensaje para compartir', () => {
  it('modo simulado: cultivo, municipio, resultado, caso simulado y orientación experimental', () => {
    const t = shareText(make('simulado'))
    expect(t).toContain('Quinua en Challapata (Oruro)')
    expect(t).toContain('🔴 Resultado: Condiciones desfavorables')
    expect(t).toContain('Lo que más pesa: Riesgo de helada (7 días)')
    expect(t).toContain('Qué hacer: Espere')
    expect(t).toContain('Caso simulado')
    expect(t).toContain('Orientación experimental')
  })
  it('modo real: sin etiqueta de simulación, con orientación experimental', () => {
    const t = shareText(make('real'))
    expect(t).not.toContain('Caso simulado')
    expect(t).toContain('Orientación experimental')
    expect(t).toContain('Quinua en Challapata')
  })
  it('sin factor decisivo (cultivo sin reglas) no rompe el mensaje', () => {
    const t = shareText({ ...make('real'), key_factor: null, status: 'gris', headline: 'Información insuficiente' })
    expect(t).not.toContain('Lo que más pesa')
    expect(t).toContain('⚪ Resultado: Información insuficiente')
  })
  it('la URL de WhatsApp codifica el texto completo', () => {
    const url = whatsappShareUrl(make('simulado'))
    expect(url.startsWith('https://wa.me/?text=')).toBe(true)
    expect(decodeURIComponent(url.split('text=')[1])).toBe(shareText(make('simulado')))
  })
})
