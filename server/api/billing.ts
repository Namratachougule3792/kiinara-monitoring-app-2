import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  const { data: logs } = await supabase
    .from('Log')
    .select('*')

  const query = getQuery(event)

  const school = query.school
  const from = query.from
  const to = query.to

  let filtered = logs || []

  if (school && school !== "All") {
    filtered = filtered.filter(l => l.school === school)
  }

  if (from) {
    filtered = filtered.filter(l => new Date(l.createdAt) >= new Date(from))
  }

  if (to) {
    filtered = filtered.filter(l => new Date(l.createdAt) <= new Date(to))
  }

  const map: any = {}

  filtered.forEach((l) => {
    if (!map[l.service]) {
      map[l.service] = {
        service: l.service,
        requests: 0,
        cost: 0
      }
    }

    map[l.service].requests++
    map[l.service].cost += 0.05
  })

  const services = Object.values(map)

  return {
    services,
    totalRequests: filtered.length,
    totalCost: filtered.length * 0.05,
    schools: [...new Set((logs || []).map(l => l.school || "School A"))]
  }
})