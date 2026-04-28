import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

export default defineEventHandler(async () => {
  try {
    const { data, error } = await supabase
      .from('Log')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("API ERROR:", err)
    return []
  }
})
