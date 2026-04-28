import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  const { error } = await supabase.from('Log').insert([
    {
      service: body.service,
      school: body.school, // IMPORTANT
      latency: body.latency,
      status: body.status, //  200 / 500
      createdAt: new Date()
    }
  ])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
})