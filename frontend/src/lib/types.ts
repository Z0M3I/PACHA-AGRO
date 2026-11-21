export type Status = 'verde' | 'amarillo' | 'rojo' | 'gris'
export interface Municipality { id: string; name: string; lat: number; lon: number; elevation: number; region: string }
export interface Department { id: string; name: string; municipalities: Municipality[] }
export interface User { id: number; full_name: string; phone: string; role: string; is_demo: boolean; whatsapp_opt_in: boolean; default_municipality_id: string | null }
export interface Daily { date: string; tmin: number | null; tmax: number | null; precip_mm: number | null; precip_prob: number | null; weather_code: number | null; storm: boolean }
export interface Block { available: boolean; source: string; kind: string; fetched_at: string | null; error: string | null; daily: Daily[]; current_temp: number | null; current_time: string | null; soil_moisture: number | null; soil_moisture_unit: string | null; extra: Record<string, any> }
export interface Weather {
  mode: 'real' | 'simulado'
  location: { id: string; name: string; department_name: string; lat: number; lon: number; elevation: number; region: string }
  generated_at: string
  forecast: Block
  recent: Block
  climatology: { available: boolean; period?: string; frost_days_month?: number; precip_mm_day_month?: number; source?: string; error?: string }
  official_alerts: { available: boolean; source: string; url: string; message: string }
  frost_risk: { level: 'alto' | 'medio' | 'bajo' | 'desconocido'; min_tmin?: number | null; date?: string | null; basis: string | null; source: string | null; frost_days_month?: number }
  storm_risk: { level: string; days: string[]; note?: string }
}
export interface Criterion { id: string; label: string; status: Status; explanation: string; data_kind: string; source: string | null; value: string | null }
export interface Recommendation {
  status: Status; headline: string; summary: string; score: number | null; confidence: string
  crop_name: string; variety: string | null; location: { name: string; department_name: string; region: string }
  scenario_status: 'implemented' | 'demo' | 'no_rules'; scenario_label: string; mode: string; disclaimer: string
  criteria: Criterion[]; actions: string[]; sources: string[]; notes: string[]; variety_note?: string
  weather_summary?: { forecast_available: boolean; forecast_error: string | null; forecast_source: string; recent_source: string | null; fetched_at: string | null }
}
export interface Crop { id: string; name: string; emoji: string; varieties: string[]; regions: Record<string, string> }
export interface Community { id: number; name: string; description: string; status: string; is_demo: boolean; department_name: string; municipality_id: string; municipality_name: string; members: number; representatives: string[]; my_membership?: { id: number; role: string; status: string } | null }
export interface Meeting { id: number; title: string; description: string; place: string; starts_at: string; cancelled: boolean; created_by: string; attendance: { si: number; no: number; tal_vez: number }; my_response: string | null }
