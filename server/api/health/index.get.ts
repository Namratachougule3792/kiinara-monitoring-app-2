import { createClient } from '@supabase/supabase-js'

const SERVICES = ["Admissions", "Attendance", "Billing", "Identity"]

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  const { data: logs } = await supabase
    .from('Log')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100)

  const map: any = {}

  SERVICES.forEach(s => {
    map[s] = { name: s, requests: 0, errors: 0, latency: 0 }
  })

  logs?.forEach(l => {
    const s = map[l.service]
    if (!s) return

    s.requests++
    s.latency += l.latency

    if (l.status >= 400) s.errors++
  })

  return SERVICES.map(name => {
    const s = map[name]

    const avg = s.requests ? Math.floor(s.latency / s.requests) : 0

    let status = "Healthy"
    if (s.errors >= 3) status = "Down"
    else if (s.errors >= 1) status = "Degraded"

    return { ...s, latency: avg, status }
  })
})