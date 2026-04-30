export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.supabaseUrl as string
  const supabaseKey = config.supabaseKey as string

  const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']

  // Fetch logs from last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  let logs: any[] = []
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/logs?created_at=gte.${since}&order=created_at.desc`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    )
    if (res.ok) logs = await res.json()
  } catch (err: any) {
    console.error('Status: failed to fetch logs:', err.message)
  }

  // Calculate per-service stats
  const serviceMap: Record<string, { total: number; errors: number; latency: number }> = {}
  SERVICES.forEach(s => { serviceMap[s] = { total: 0, errors: 0, latency: 0 } })

  logs.forEach((l: any) => {
    const s = serviceMap[l.service]
    if (!s) return
    s.total++
    s.latency += l.latency || 0
    if (l.status >= 400) s.errors++
  })

  const services = SERVICES.map(name => {
    const s = serviceMap[name]
    const errorRate = s.total > 0 ? s.errors / s.total : 0
    let status = 'Healthy'
    if (errorRate >= 0.5) status = 'Down'
    else if (errorRate > 0) status = 'Degraded'
    return {
      name,
      status,
      uptime: s.total > 0 ? +((1 - errorRate) * 100).toFixed(1) : 100,
      avgLatency: s.total > 0 ? Math.floor(s.latency / s.total) : 0,
      total: s.total,
      errors: s.errors
    }
  })

  let overall = 'Healthy'
  if (services.some(s => s.status === 'Down')) overall = 'Down'
  else if (services.some(s => s.status === 'Degraded')) overall = 'Degraded'

  // Build incidents from log sequences
  const incidents: any[] = []

  SERVICES.forEach(serviceName => {
    const serviceLogs = logs
      .filter((l: any) => l.service === serviceName)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    if (serviceLogs.length === 0) return

    // Group into 5-minute buckets
    const buckets: Record<string, { total: number; errors: number; time: string }> = {}

    serviceLogs.forEach((l: any) => {
      const d = new Date(l.created_at)
      d.setSeconds(0, 0)
      d.setMinutes(Math.floor(d.getMinutes() / 5) * 5)
      const key = d.toISOString()
      if (!buckets[key]) buckets[key] = { total: 0, errors: 0, time: l.created_at }
      buckets[key].total++
      if (l.status >= 400) buckets[key].errors++
    })

    const bucketList = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b))

    let currentIncident: any = null

    bucketList.forEach(([time, bucket]) => {
      const errorRate = bucket.total > 0 ? bucket.errors / bucket.total : 0
      let state = 'Healthy'
      if (errorRate >= 0.5) state = 'Down'
      else if (errorRate > 0) state = 'Degraded'

      if (state !== 'Healthy' && !currentIncident) {
        currentIncident = { service: serviceName, status: state, started_at: bucket.time, resolved_at: null }
      } else if (state !== 'Healthy' && currentIncident) {
        if (state === 'Down') currentIncident.status = 'Down'
      } else if (state === 'Healthy' && currentIncident) {
        currentIncident.resolved_at = bucket.time
        const mins = Math.round((new Date(bucket.time).getTime() - new Date(currentIncident.started_at).getTime()) / 60000)
        currentIncident.duration = mins < 60 ? `${mins} min` : `${Math.round(mins / 60)} hr`
        incidents.push({ ...currentIncident })
        currentIncident = null
      }
    })

    if (currentIncident) {
      currentIncident.resolved_at = null
      currentIncident.duration = 'Ongoing'
      incidents.push({ ...currentIncident })
    }
  })

  incidents.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())

  return { overall, services, incidents }
})