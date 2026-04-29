import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  const { data: rows, error } = await supabase
    .from('schools')
    .select('name')
    .order('name')

  if (error) {
    console.error('Schools fetch error:', error.message)
    return []
  }

  if (rows && rows.length > 0) {
    return rows.map((r: any) => r.name)
  }

  // Fallback: derive from logs
  const { data: logs } = await supabase.from('logs').select('school')
  return [...new Set((logs || []).map((l: any) => l.school).filter(Boolean))].sort()
})