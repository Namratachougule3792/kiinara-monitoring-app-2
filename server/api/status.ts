import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  const allLogs = logs || []
  const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']
  const serviceMap: Record<string, { total: number; errors: number; latency: number }> = {}
  SERVICES.forEach(s => { serviceMap[s] = { total: 0, errors: 0, latency: 0 } })

  allLogs.forEach((l: any) => {
    const s = serviceMap[l.service]
    if (!s) return
    s.total++
    s.latency += Number(l.latency) || 0
    if (Number(l.status) >= 400) s.errors++
  })

  const services = SERVICES.map(name => {
    const s = serviceMap[name]
    const errorRate = s.total > 0 ? s.errors / s.total : 0
    let status = 'Healthy'
    if (s.total > 0 && errorRate >= 0.5) status = 'Down'
    else if (s.total > 0 && errorRate > 0) status = 'Degraded'

    return {
      name, status,
      uptime: s.total > 0 ? +((1 - errorRate) * 100).toFixed(1) : 100,
      avgLatency: s.total > 0 ? Math.floor(s.latency / s.total) : 0
    }
  })

  let overall = 'Healthy'
  if (services.some(s => s.status === 'Down')) overall = 'Down'
  else if (services.some(s => s.status === 'Degraded')) overall = 'Degraded'

  const incidents = allLogs
    .filter((l: any) => Number(l.status) >= 400)
    .slice(0, 50)
    .map((l: any) => ({
      id: l.id,
      service: l.service,
      school: l.school,
      status: l.status,
      latency: l.latency,
      timestamp: l.created_at,
      message: `${l.service} returned ${l.status} for ${l.school}`
    }))

  return { overall, services, incidents }
})