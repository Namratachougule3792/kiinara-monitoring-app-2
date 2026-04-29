import { createHmac, createHash } from 'crypto'

const LOG_GROUP = 'kiinara-app-logs'
const LOG_STREAM = 'app-stream'

function getEnv() {
  const config = useRuntimeConfig()
  return {
    region: config.awsRegion as string || 'ap-south-1',
    accessKeyId: config.awsAccessKeyId as string || '',
    secretAccessKey: config.awsSecretAccessKey as string || ''
  }
}
function sha256hex(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex')
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest()
}

function getSigningKey(secret: string, date: string, region: string, service: string): Buffer {
  const kDate = hmacSha256(`AWS4${secret}`, date)
  const kRegion = hmacSha256(kDate, region)
  const kService = hmacSha256(kRegion, service)
  return hmacSha256(kService, 'aws4_request')
}

function signRequest(opts: {
  method: string
  host: string
  path: string
  body: string
  target: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}): Record<string, string> {
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateStamp = amzDate.slice(0, 8)

  const payloadHash = sha256hex(opts.body)
  const canonicalHeaders =
    `content-type:application/x-amz-json-1.1\n` +
    `host:${opts.host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${opts.target}\n`

  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target'

  const canonicalRequest = [
    opts.method,
    opts.path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n')

  const credentialScope = `${dateStamp}/${opts.region}/logs/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest)
  ].join('\n')

  const signingKey = getSigningKey(opts.secretAccessKey, dateStamp, opts.region, 'logs')
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  return {
    'Content-Type': 'application/x-amz-json-1.1',
    'X-Amz-Date': amzDate,
    'X-Amz-Target': opts.target,
    'Authorization': `AWS4-HMAC-SHA256 Credential=${opts.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  }
}

async function cwRequest(target: string, body: object): Promise<any> {
  const { region, accessKeyId, secretAccessKey } = getEnv()
  const host = `logs.${region}.amazonaws.com`
  const bodyStr = JSON.stringify(body)

  const headers = signRequest({
    method: 'POST',
    host,
    path: '/',
    body: bodyStr,
    target,
    region,
    accessKeyId,
    secretAccessKey
  })

  const res = await fetch(`https://${host}/`, {
    method: 'POST',
    headers,
    body: bodyStr
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`CloudWatch ${target} failed: ${text}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : {}
}

// Ensure log group and stream exist
async function ensureLogStream(): Promise<void> {
  try {
    await cwRequest('Logs_20140328.CreateLogGroup', { logGroupName: LOG_GROUP })
  } catch (_) {}
  try {
    await cwRequest('Logs_20140328.CreateLogStream', {
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM
    })
  } catch (_) {}
}

export async function sendToCloudWatch(message: string): Promise<void> {
  await ensureLogStream()

  // Get sequence token
  let sequenceToken: string | undefined
  try {
    const res = await cwRequest('Logs_20140328.DescribeLogStreams', {
      logGroupName: LOG_GROUP,
      logStreamNamePrefix: LOG_STREAM
    })
    sequenceToken = res.logStreams?.find((s: any) => s.logStreamName === LOG_STREAM)?.uploadSequenceToken
  } catch (_) {}

  const params: any = {
    logGroupName: LOG_GROUP,
    logStreamName: LOG_STREAM,
    logEvents: [{ message, timestamp: Date.now() }]
  }
  if (sequenceToken) params.sequenceToken = sequenceToken

  await cwRequest('Logs_20140328.PutLogEvents', params)
}

export async function fetchFromCloudWatch(options?: {
  service?: string
  limit?: number
}): Promise<any[]> {
  try {
    const res = await cwRequest('Logs_20140328.GetLogEvents', {
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      limit: options?.limit || 200,
      startFromHead: false
    })

    const events = (res.events || [])
      .map((e: any) => {
        let parsed: any = {}
        try { parsed = JSON.parse(e.message || '{}') } catch (_) {}
        return {
          timestamp: new Date(e.timestamp || 0).toISOString(),
          message: e.message || '',
          school: parsed.school,
          service: parsed.service,
          status: parsed.status,
          latency: parsed.latency
        }
      })
      .filter((e: any) => !options?.service || e.service === options.service)
      .reverse()

    return events
  } catch (err: any) {
    console.error('CloudWatch fetch error:', err.message)
    return []
  }
}