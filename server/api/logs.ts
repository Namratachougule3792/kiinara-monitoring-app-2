import { createClient } from '@supabase/supabase-js'
import { fetchFromCloudWatch } from '../utils/cloudwatch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const source = (query.source as string) || 'supabase'
  const service = query.service as string | undefined
  const school = query.school as string | undefined

  if (source === 'cloudwatch') {
    return await fetchFromCloudWatch({ service, limit: 100 })
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  let req = supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (service) req = req.eq('service', service)
  if (school && school !== 'All') req = req.eq('school', school)

  const { data, error } = await req

  if (error) {
    console.error('Logs fetch error:', error)
    return []
  }

  return data || []
})