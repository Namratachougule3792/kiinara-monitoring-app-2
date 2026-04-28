import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseKey
  )

  const { data, error } = await supabase
    .from('Log')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100)

  if (error) {
    return { error: error.message }
  }

  return data
})