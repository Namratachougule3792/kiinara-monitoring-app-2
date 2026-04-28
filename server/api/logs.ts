import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  const { data } = await supabase
    .from('Log')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100)

  return data || []
})