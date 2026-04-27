import { prisma } from '../../db'

const SERVICES = ["Admissions", "Attendance", "Billing", "Identity"]

export default defineEventHandler(async () => {
  const logs = await prisma.logs.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200
  })

  const map: any = {}

  // initialize all services
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

  return Object.values(map).map((s: any) => {
    const avgLatency = s.requests ? Math.floor(s.latency / s.requests) : 0

    let status = "Healthy"
    if (s.errors > 10) status = "Down"
    else if (s.errors > 3) status = "Degraded"

    return {
      ...s,
      latency: avgLatency,
      status
    }
  })
})
