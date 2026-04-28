import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  let req = supabase.from('Log').select('*')

  if (query.service) req = req.eq('service', query.service)
  if (query.school && query.school !== 'All') req = req.eq('school', query.school)

  const { data } = await req.order('createdAt', { ascending: false }).limit(100)

  return data || []
})