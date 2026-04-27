import { prisma } from '../db'

export default defineEventHandler(async () => {
  const logs = await prisma.logs.findMany()

  const pricePerRequest = 0.05

  const map: any = {}

  logs.forEach((l) => {
    if (!map[l.service]) {
      map[l.service] = {
        service: l.service,
        requests: 0,
        cost: 0
      }
    }

    map[l.service].requests++
    map[l.service].cost += pricePerRequest
  })

  return Object.values(map)
})
