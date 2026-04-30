import { sendToCloudWatch } from '../utils/cloudwatch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { school, service, status, latency } = body

  if (!school || !service || status === undefined) {
    return { error: 'Missing required fields: school, service, status' }
  }

  const supabaseUrl = config.supabaseUrl as string
  const supabaseKey = config.supabaseKey as string

  if (!supabaseUrl || !supabaseKey) {
    return { error: 'Missing Supabase credentials' }
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }

  // Insert school (ignore duplicate)
  try {
    await fetch(`${supabaseUrl}/rest/v1/schools`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=ignore-duplicates' },
      body: JSON.stringify({ name: school.trim() })
    })
  } catch (err: any) {
    console.error('School insert (non-fatal):', err.message)
  }

  // Insert log to Supabase
  try {
    const logRes = await fetch(`${supabaseUrl}/rest/v1/logs`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        school: school.trim(),
        service,
        status,
        latency: latency || 0,
        created_at: new Date().toISOString()
      })
    })

    if (!logRes.ok) {
      const txt = await logRes.text()
      return { error: `Log insert failed: ${txt}` }
    }
  } catch (err: any) {
    return { error: err.message }
  }

  // Push to CloudWatch (non-blocking)
  sendToCloudWatch(JSON.stringify({
    school: school.trim(),
    service,
    status,
    latency: latency || 0,
    timestamp: new Date().toISOString()
  })).catch((e: any) => console.error('CloudWatch push failed (non-fatal):', e.message))

  return { success: true }
})