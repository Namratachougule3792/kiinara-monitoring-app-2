import { prisma } from '../../db'

const SERVICES = ["Admissions", "Attendance", "Billing", "Identity"]

export default defineEventHandler(async () => {
  const logs = await prisma.logs.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  const map: any = {}

  SERVICES.forEach((s) => {
    map[s] = {
      name: s,
      requests: 0,
      errors: 0,
      latency: 0
    }
  })

  logs.forEach((l) => {
    const s = map[l.service]
    if (!s) return

    s.requests++
    s.latency += l.latency

    if (l.status >= 400) s.errors++
  })

  return SERVICES.map((name) => {
    const s = map[name]

    const avgLatency = s.requests
      ? Math.floor(s.latency / s.requests)
      : 0

    let status = "Healthy"
    if (s.errors > 15) status = "Down"
    else if (s.errors > 5) status = "Degraded"

    return {
      ...s,
      latency: avgLatency,
      status
    }
  })
})
