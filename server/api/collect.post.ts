import { createClient } from '@supabase/supabase-js'
import { sendToCloudWatch } from '../utils/cloudwatch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { school, service, status, latency } = body

  if (!school || !service || status === undefined) {
    return { error: 'Missing required fields: school, service, status' }
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  // Save school name so it appears in dropdowns
  await supabase.from('schools').upsert(
    { name: school },
    { onConflict: 'name', ignoreDuplicates: true }
  )

  // Save log event
  const { error: logError } = await supabase.from('logs').insert([{
    school,
    service,
    status,
    latency: latency || 0,
    created_at: new Date().toISOString()
  }])

  if (logError) {
    console.error('Supabase insert error:', logError)
    return { error: logError.message }
  }

  // Push to CloudWatch (non-blocking)
  sendToCloudWatch(JSON.stringify({
    school, service, status, latency,
    timestamp: new Date().toISOString()
  })).catch(err => console.error('CloudWatch error (non-fatal):', err.message))

  return { success: true }
})