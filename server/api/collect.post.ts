export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { school, service, status, latency } = body

  if (!school || !service || status === undefined) {
    return { error: 'Missing required fields: school, service, status' }
  }

  const supabaseUrl = config.supabaseUrl
  const supabaseKey = config.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    return { error: 'Missing Supabase credentials in env vars' }
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }

  // Step 1: Insert school (ignore if already exists)
  try {
    const schoolRes = await fetch(`${supabaseUrl}/rest/v1/schools`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify({ name: school.trim() })
    })
    // 200, 201, 204 are all fine — just log if something unexpected
    if (!schoolRes.ok && schoolRes.status !== 409) {
      const txt = await schoolRes.text()
      console.error('School insert warning (non-fatal):', schoolRes.status, txt)
    }
  } catch (err: any) {
    console.error('School insert exception (non-fatal):', err.message)
  }

  // Step 2: Insert log
  try {
    const logRes = await fetch(`${supabaseUrl}/rest/v1/logs`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=minimal'
      },
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
      console.error('Log insert failed:', logRes.status, txt)
      return { error: `Log insert failed (${logRes.status}): ${txt}` }
    }
  } catch (err: any) {
    console.error('Log insert exception:', err.message)
    return { error: err.message }
  }

  // Step 3: Push to CloudWatch (completely non-blocking, never fails the request)
  try {
    const { sendToCloudWatch } = await import('../utils/cloudwatch')
    sendToCloudWatch(JSON.stringify({
      school: school.trim(),
      service,
      status,
      latency: latency || 0,
      timestamp: new Date().toISOString()
    })).catch((e: any) => console.error('CloudWatch push failed (non-fatal):', e.message))
  } catch (_) {}

  return { success: true }
})
