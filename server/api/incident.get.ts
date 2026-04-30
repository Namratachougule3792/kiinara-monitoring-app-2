// Calculates real incidents by analyzing log sequences
// An incident starts when a service first errors, ends when it recovers

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.supabaseUrl
  const supabaseKey = config.supabaseKey

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const res = await fetch(
    `${supabaseUrl}/rest/v1/logs?created_at=gte.${since}&order=created_at.asc`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  )

  if (!res.ok) return { incidents: [] }

  const logs = await res.json()
  const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']

  // Track incidents per service
  const incidents: any[] = []

  SERVICES.forEach(serviceName => {
    const serviceLogs = logs.filter((l: any) => l.service === serviceName)
    if (serviceLogs.length === 0) return

    // Sliding window: check every 5 logs to detect state changes
    let currentIncident: any = null

    // Group logs into 5-minute buckets to detect status changes
    const buckets: Record<string, { total: number; errors: number; lastTime: string }> = {}

    serviceLogs.forEach((l: any) => {
      // Round to nearest 5 minutes
      const d = new Date(l.created_at)
      d.setSeconds(0, 0)
      d.setMinutes(Math.floor(d.getMinutes() / 5) * 5)
      const key = d.toISOString()

      if (!buckets[key]) buckets[key] = { total: 0, errors: 0, lastTime: l.created_at }
      buckets[key].total++
      buckets[key].lastTime = l.created_at
      if (l.status >= 400) buckets[key].errors++
    })

    const bucketEntries = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b))

    bucketEntries.forEach(([time, bucket]) => {
      const errorRate = bucket.total > 0 ? bucket.errors / bucket.total : 0
      let state = 'Healthy'
      if (errorRate >= 0.5) state = 'Down'
      else if (errorRate > 0) state = 'Degraded'

      if (state !== 'Healthy' && !currentIncident) {
        // Start new incident
        currentIncident = {
          service: serviceName,
          status: state,
          started_at: time,
          resolved_at: null,
          duration: null
        }
      } else if (state !== 'Healthy' && currentIncident) {
        // Update status if worse
        if (state === 'Down') currentIncident.status = 'Down'
        currentIncident.lastSeen = bucket.lastTime
      } else if (state === 'Healthy' && currentIncident) {
        // Resolve incident
        currentIncident.resolved_at = time
        const start = new Date(currentIncident.started_at).getTime()
        const end = new Date(time).getTime()
        const mins = Math.round((end - start) / 60000)
        currentIncident.duration = mins < 60
          ? `${mins} minute${mins !== 1 ? 's' : ''}`
          : `${Math.round(mins / 60)} hour${Math.round(mins / 60) !== 1 ? 's' : ''}`
        incidents.push({ ...currentIncident })
        currentIncident = null
      }
    })

    // If still open incident
    if (currentIncident) {
      currentIncident.resolved_at = null
      currentIncident.duration = 'Ongoing'
      incidents.push({ ...currentIncident })
    }
  })

  // Sort newest first
  incidents.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())

  return { incidents }
})