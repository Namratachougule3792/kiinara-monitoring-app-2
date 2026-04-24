import { prisma } from '../../db'

export default defineEventHandler(async () => {
  const logs = await prisma.logs.findMany()

  const map: any = {}

  logs.forEach((l) => {
    if (!map[l.service]) {
      map[l.service] = {
        name: l.service,
        requests: 0,
        errors: 0,
        latency: 0
      }
    }

    map[l.service].requests++
    map[l.service].latency += l.latency

    if (l.status >= 400) map[l.service].errors++
  })

  return Object.values(map).map((s: any) => {
    const avgLatency = s.requests ? Math.floor(s.latency / s.requests) : 0

    let status = "Healthy"
    if (s.errors > 20) status = "Down"
    else if (s.errors > 5) status = "Degraded"

    return {
      ...s,
      latency: avgLatency,
      status
    }
  })
})