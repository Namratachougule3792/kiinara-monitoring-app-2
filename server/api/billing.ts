import { createClient } from '@supabase/supabase-js'

const COST_PER_REQUEST = 0.05

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  let req = supabase.from('logs').select('*')

  if (query.from) req = req.gte('created_at', new Date(query.from as string).toISOString())
  if (query.to) {
    const toDate = new Date(query.to as string)
    toDate.setHours(23, 59, 59, 999)
    req = req.lte('created_at', toDate.toISOString())
  }

  const { data: logs, error } = await req.order('created_at', { ascending: false })

  if (error) {
    return { services: [], schools: [], schoolBreakdown: [], totalRequests: 0, totalCost: 0 }
  }

  const allLogs = logs || []

  const { data: schoolRows } = await supabase.from('schools').select('name').order('name')
  const allSchools = schoolRows?.map((r: any) => r.name) ||
    [...new Set(allLogs.map((l: any) => l.school).filter(Boolean))].sort()

  const filtered = (query.school && query.school !== 'All')
    ? allLogs.filter((l: any) => l.school === query.school)
    : allLogs

  const serviceMap: Record<string, any> = {}
  filtered.forEach((l: any) => {
    if (!serviceMap[l.service]) {
      serviceMap[l.service] = { service: l.service, requests: 0, errors: 0, cost: 0 }
    }
    serviceMap[l.service].requests++
    serviceMap[l.service].cost += COST_PER_REQUEST
    if (l.status >= 400) serviceMap[l.service].errors++
  })

  const schoolMap: Record<string, any> = {}
  filtered.forEach((l: any) => {
    const key = l.school || 'Unknown'
    if (!schoolMap[key]) schoolMap[key] = { school: key, requests: 0, cost: 0 }
    schoolMap[key].requests++
    schoolMap[key].cost += COST_PER_REQUEST
  })

  return {
    services: Object.values(serviceMap).sort((a: any, b: any) => b.requests - a.requests),
    schoolBreakdown: Object.values(schoolMap).sort((a: any, b: any) => b.requests - a.requests),
    schools: allSchools,
    totalRequests: filtered.length,
    totalCost: +(filtered.length * COST_PER_REQUEST).toFixed(2)
  }
})