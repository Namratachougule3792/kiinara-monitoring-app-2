import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  GetLogEventsCommand,
  DescribeLogStreamsCommand,
  CreateLogGroupCommand,
  CreateLogStreamCommand
} from '@aws-sdk/client-cloudwatch-logs'

export const LOG_GROUP = 'kiinara-app-logs'
export const LOG_STREAM = 'app-stream'

const getClient = () =>
  new CloudWatchLogsClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

async function ensureLogStream(client: CloudWatchLogsClient) {
  try {
    await client.send(new CreateLogGroupCommand({ logGroupName: LOG_GROUP }))
  } catch (_) {}
  try {
    await client.send(new CreateLogStreamCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM
    }))
  } catch (_) {}
}

async function getSequenceToken(client: CloudWatchLogsClient): Promise<string | undefined> {
  const res = await client.send(new DescribeLogStreamsCommand({
    logGroupName: LOG_GROUP,
    logStreamNamePrefix: LOG_STREAM
  }))
  return res.logStreams?.find(s => s.logStreamName === LOG_STREAM)?.uploadSequenceToken
}

export async function sendToCloudWatch(message: string): Promise<void> {
  const client = getClient()
  await ensureLogStream(client)

  let sequenceToken: string | undefined
  try {
    sequenceToken = await getSequenceToken(client)
  } catch (_) {}

  const params: any = {
    logGroupName: LOG_GROUP,
    logStreamName: LOG_STREAM,
    logEvents: [{ message, timestamp: Date.now() }]
  }
  if (sequenceToken) params.sequenceToken = sequenceToken

  await client.send(new PutLogEventsCommand(params))
}

export async function fetchFromCloudWatch(options?: {
  service?: string
  limit?: number
}): Promise<any[]> {
  const client = getClient()
  try {
    const res = await client.send(new GetLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      limit: options?.limit || 100,
      startFromHead: false
    }))

    return (res.events || [])
      .map(e => {
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
      .filter(e => !options?.service || e.service === options.service)
      .reverse()
  } catch (err: any) {
    console.error('CloudWatch fetch error:', err.message)
    return []
  }
}