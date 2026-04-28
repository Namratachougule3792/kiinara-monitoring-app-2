export default defineEventHandler(async () => {
  const logs = await $fetch('/api/logs')

  const services: any = {}

  logs.forEach((l: any) => {
    if (!services[l.service]) {
      services[l.service] = {
        total: 0,
        errors: 0
      }
    }

    services[l.service].total++

    if (l.status === "Down") {
      services[l.service].errors++
    }
  })

  let overall = "Healthy"

  Object.values(services).forEach((s: any) => {
    const rate = s.errors / s.total

    if (rate > 0.3) overall = "Down"
    else if (rate > 0.1 && overall !== "Down") overall = "Degraded"
  })

  return {
    overall
  }
})