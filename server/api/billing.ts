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

  const { data: logs, error } = await req.order('created_at', { ascending: true })
  if (error) return { services: [], schools: [], schoolBreakdown: [], chartData: [], totalRequests: 0, totalCost: 0 }

  const allLogs = logs || []

  const { data: schoolRows } = await supabase.from('schools').select('name').order('name')
  const allSchools: string[] = schoolRows?.map((r: any) => r.name) ||
    [...new Set(allLogs.map((l: any) => l.school).filter(Boolean))].sort() as string[]

  const filtered = (query.school && query.school !== 'All')
    ? allLogs.filter((l: any) => l.school === query.school)
    : allLogs

  // Per-service aggregation
  const serviceMap: Record<string, any> = {}
  const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']
  SERVICES.forEach(s => { serviceMap[s] = { service: s, requests: 0, errors: 0, cost: 0 } })

  filtered.forEach((l: any) => {
    if (!serviceMap[l.service]) return
    serviceMap[l.service].requests++
    serviceMap[l.service].cost += COST_PER_REQUEST
    if (Number(l.status) >= 400) serviceMap[l.service].errors++
  })

  // Per-school aggregation
  const schoolMap: Record<string, any> = {}
  filtered.forEach((l: any) => {
    const key = l.school || 'Unknown'
    if (!schoolMap[key]) schoolMap[key] = { school: key, requests: 0, cost: 0 }
    schoolMap[key].requests++
    schoolMap[key].cost += COST_PER_REQUEST
  })

  // Chart data — group by hour
  const chartMap: Record<string, Record<string, number>> = {}
  filtered.forEach((l: any) => {
    const hour = new Date(l.created_at).toISOString().substring(0, 13) + ':00'
    if (!chartMap[hour]) chartMap[hour] = { time: hour, Admissions: 0, Attendance: 0, Billing: 0, Identity: 0 }
    if (chartMap[hour][l.service] !== undefined) chartMap[hour][l.service]++
  })

  const chartData = Object.values(chartMap).sort((a: any, b: any) => a.time.localeCompare(b.time))

  // Efficiency: successful / total
  const totalReq = filtered.length
  const totalErrors = filtered.filter((l: any) => Number(l.status) >= 400).length
  const efficiency = totalReq > 0 ? Math.round(((totalReq - totalErrors) / totalReq) * 100) : 100

  return {
    services: Object.values(serviceMap).sort((a: any, b: any) => b.requests - a.requests),
    schoolBreakdown: Object.values(schoolMap).sort((a: any, b: any) => b.requests - a.requests),
    schools: allSchools,
    chartData,
    totalRequests: totalReq,
    totalCost: +(totalReq * COST_PER_REQUEST).toFixed(2),
    efficiency
  }
})