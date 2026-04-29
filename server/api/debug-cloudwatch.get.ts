export default defineEventHandler(async () => {
  const region = process.env.AWS_REGION || 'ap-south-1'
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || ''
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ''

  const result: any = {
    hasRegion: !!region,
    hasAccessKey: !!accessKeyId,
    hasSecretKey: !!secretAccessKey,
    region,
    accessKeyPreview: accessKeyId ? accessKeyId.slice(0, 8) + '...' : 'MISSING',
  }

  if (!accessKeyId || !secretAccessKey) {
    result.error = 'Missing AWS credentials'
    return result
  }

  // Try to send a test log
  try {
    const { sendToCloudWatch } = await import('../utils/cloudwatch')
    await sendToCloudWatch(JSON.stringify({
      school: 'DEBUG_TEST',
      service: 'Admissions',
      status: 200,
      latency: 99,
      timestamp: new Date().toISOString()
    }))
    result.sendResult = 'SUCCESS'
  } catch (err: any) {
    result.sendError = err.message
    result.sendErrorFull = String(err)
  }

  // Try to fetch logs
  try {
    const { fetchFromCloudWatch } = await import('../utils/cloudwatch')
    const logs = await fetchFromCloudWatch({ limit: 5 })
    result.fetchResult = 'SUCCESS'
    result.logCount = logs.length
    result.sampleLog = logs[0] || null
  } catch (err: any) {
    result.fetchError = err.message
    result.fetchErrorFull = String(err)
  }

  return result
})