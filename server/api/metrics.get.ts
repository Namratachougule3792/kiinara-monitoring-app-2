import { prisma } from '../db'

export default defineEventHandler(async () => {
  const data = await prisma.usage.findMany()

  const map: any = {}

  data.forEach((d) => {
    if (!map[d.service]) {
      map[d.service] = {
        service: d.service,
        requests: 0,
        cost: 0
      }
    }

    map[d.service].requests += d.requests
    map[d.service].cost += d.cost
  })

  return Object.values(map)
})