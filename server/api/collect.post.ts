import { createClient } from '@supabase/supabase-js'
import { sendToCloudWatch } from '../utils/cloudwatch'

export default defineEventHandler(async (event) => {
  // Handle CORS preflight
  if (event.node.req.method === 'OPTIONS') {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept'
    })
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }

  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept'
  })

  let body: any
  try {
    body = await readBody(event)
  } catch (e) {
    return { error: 'Invalid request body' }
  }

  const config = useRuntimeConfig()
  const { school, service, status, latency } = body

  if (!school || !service || status === undefined) {
    return { error: 'Missing required fields: school, service, status' }
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  // 1. Save school name
  const { error: schoolError } = await supabase
    .from('schools')
    .upsert({ name: school.trim() }, { onConflict: 'name', ignoreDuplicates: true })

  if (schoolError) {
    console.error('School upsert error:', schoolError.message)
  }

  // 2. Save log
  const { error: logError } = await supabase.from('logs').insert([{
    school: school.trim(),
    service,
    status: Number(status),
    latency: Number(latency) || 0,
    created_at: new Date().toISOString()
  }])

  if (logError) {
    console.error('Log insert error:', logError.message)
    return { error: logError.message }
  }

  // 3. Push to CloudWatch (fire and forget)
  sendToCloudWatch(JSON.stringify({
    school: school.trim(),
    service,
    status: Number(status),
    latency: Number(latency) || 0,
    timestamp: new Date().toISOString()
  })).catch(err => console.error('CloudWatch (non-fatal):', err.message))

  return { success: true }
})