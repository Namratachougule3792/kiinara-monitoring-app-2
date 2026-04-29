export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.supabaseUrl
  const supabaseKey = config.supabaseKey

  const result: any = {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    supabaseUrlPreview: supabaseUrl ? supabaseUrl.slice(0, 30) + '...' : 'MISSING',
    supabaseKeyPreview: supabaseKey ? supabaseKey.slice(0, 15) + '...' : 'MISSING',
    monitoringUrl: config.monitoringUrl || 'not set',
  }

  // Test Supabase connection
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/schools?limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      const text = await res.text()
      result.supabaseStatus = res.status
      result.supabaseResponse = text.slice(0, 200)
      result.supabaseOk = res.ok
    } catch (err: any) {
      result.supabaseError = err.message
    }

    // Test insert to logs
    try {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          school: 'DEBUG_TEST',
          service: 'Admissions',
          status: 200,
          latency: 100,
          created_at: new Date().toISOString()
        })
      })
      const insertText = await insertRes.text()
      result.insertStatus = insertRes.status
      result.insertResponse = insertText.slice(0, 200)
      result.insertOk = insertRes.ok
    } catch (err: any) {
      result.insertError = err.message
    }
  }

  return result
})