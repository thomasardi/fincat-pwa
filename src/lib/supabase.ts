import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Simulation = {
  id?: string
  user_id?: string
  principal: number
  annual_rate: number
  period: number
  period_unit: 'tahun' | 'bulan'
  topup_amount?: number
  topup_freq?: string
  final_balance?: number
  total_interest?: number
  growth_pct?: number
  result_snapshot?: object
}

export type Feedback = {
  rating: number
  message?: string
  name?: string
  email?: string
  user_id?: string
}

export type FeatureRequest = {
  feature_id?: string
  message: string
  user_id?: string
}

export const saveSimulation = async (sim: Simulation) => {
  const { data, error } = await supabase.from('simulations').insert(sim).select().single()
  return { data, error }
}

export const saveFeedback = async (fb: Feedback) => {
  const { data, error } = await supabase.from('feedback').insert(fb).select().single()
  return { data, error }
}

export const saveFeatureRequest = async (req: FeatureRequest) => {
  const { data, error } = await supabase.from('feature_requests').insert(req).select().single()
  return { data, error }
}

export const trackUsage = async (feature: string, action: string, metadata?: object) => {
  const sessionId = typeof window !== 'undefined' ? (sessionStorage.getItem('fin_sid') || crypto.randomUUID()) : ''
  if (typeof window !== 'undefined') sessionStorage.setItem('fin_sid', sessionId)
  await supabase.from('feature_usage').insert({ feature, action, session_id: sessionId, metadata })
}
