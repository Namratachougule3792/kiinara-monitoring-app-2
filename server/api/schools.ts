import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  const { data: schoolRows } = await supabase
    .from('schools')
    .select('name')
    .order('name')

  if (schoolRows && schoolRows.length > 0) {
    return schoolRows.map((r: any) => r.name)
  }

  // Fallback: derive from logs table
  const { data: logs } = await supabase.from('logs').select('school')
  const names = [...new Set((logs || []).map((l: any) => l.school).filter(Boolean))]
  return (names as string[]).sort()
})