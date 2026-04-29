import { createClient } from '@supabase/supabase-js'

const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: logs, error } = await supabase
    .from('logs')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Health fetch error:', error.message)
    return SERVICES.map(name => ({
      name, status: 'Healthy', requests: 0, errors: 0, latency: 0
    }))
  }

  const map: Record<string, { requests: number; errors: number; totalLatency: number }> = {}
  SERVICES.forEach(s => { map[s] = { requests: 0, errors: 0, totalLatency: 0 } })

  ;(logs || []).forEach((l: any) => {
    const s = map[l.service]
    if (!s) return
    s.requests++
    s.totalLatency += Number(l.latency) || 0
    if (Number(l.status) >= 400) s.errors++
  })

  return SERVICES.map(name => {
    const s = map[name]
    const avgLatency = s.requests ? Math.floor(s.totalLatency / s.requests) : 0
    const errorRate = s.requests ? s.errors / s.requests : 0

    let status = 'Healthy'
    if (s.requests > 0 && errorRate >= 0.5) status = 'Down'
    else if (s.requests > 0 && errorRate > 0) status = 'Degraded'

    return { name, status, requests: s.requests, errors: s.errors, latency: avgLatency }
  })
})