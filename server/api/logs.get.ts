import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_KEY
  )

  const { data, error } = await supabase
    .from('Log')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100)

  if (error) {
    console.error("Supabase error:", error)
    return []
  }

  return data
})