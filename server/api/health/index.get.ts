import { createClient } from '@supabase/supabase-js'
import { sendLog } from '../../utils/cloudwatch'

const SERVICES = ["Admissions", "Attendance", "Billing", "Identity"]

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  const { data: logs, error } = await supabase
    .from('Log')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100)

  if (error) {
    console.error(error)
    return []
  }

  const map: any = {}

  SERVICES.forEach((s) => {
    map[s] = {
      name: s,
      requests: 0,
      errors: 0,
      latency: 0
    }
  })

  for (const l of logs || []) {
    const s = map[l.service]
    if (!s) continue

    s.requests++
    s.latency += l.latency

    // 🔥 ERROR DETECT + SEND TO CLOUDWATCH
    if (l.status === "Down" || l.status >= 400) {
      s.errors++

      await sendLog(`${l.service} is DOWN at ${l.createdAt}`)
    }
  }

  return SERVICES.map((name) => {
    const s = map[name]

    const avgLatency = s.requests
      ? Math.floor(s.latency / s.requests)
      : 0

    let status = "Healthy"
    if (s.errors > 2) status = "Down"
    else if (s.errors > 0) status = "Degraded"

    return {
      ...s,
      latency: avgLatency,
      status
    }
  })
})