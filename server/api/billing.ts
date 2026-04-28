export default defineEventHandler(async () => {
  const logs = await $fetch('/api/logs')

  const map: any = {}

  logs.forEach((l: any) => {
    if (!map[l.service]) {
      map[l.service] = {
        service: l.service,
        requests: 0,
        cost: 0
      }
    }

    map[l.service].requests++

    // simple cost logic (₹0.05 per request)
    map[l.service].cost += 0.05
  })

  const services = Object.values(map)

  const totalRequests = services.reduce((a: any, b: any) => a + b.requests, 0)
  const totalCost = services.reduce((a: any, b: any) => a + b.cost, 0)

  return {
    totalRequests,
    totalCost,
    services
  }
})