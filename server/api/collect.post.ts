import { createClient } from '@supabase/supabase-js'
import { sendToCloudWatch } from '../utils/cloudwatch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { school, service, status, latency } = body

  if (!school || !service || status === undefined) {
    return { error: 'Missing required fields' }
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  // ✅ upsert school
  await supabase.from('schools').upsert(
    { name: school },
    { onConflict: 'name' }
  )

  // ✅ store numeric status
  const { error } = await supabase.from('logs').insert([{
    school,
    service,
    status, // <-- keep 200 / 500
    latency: latency || 0,
    created_at: new Date().toISOString()
  }])

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  // cloudwatch (non blocking)
  sendToCloudWatch(JSON.stringify({
    school, service, status, latency
  })).catch(() => {})

  return { success: true }
})