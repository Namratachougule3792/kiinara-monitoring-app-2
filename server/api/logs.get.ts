import {
  CloudWatchLogsClient,
  GetLogEventsCommand
} from "@aws-sdk/client-cloudwatch-logs"

export default defineEventHandler(async () => {
  const client = new CloudWatchLogsClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  const res = await client.send(new GetLogEventsCommand({
    logGroupName: "kiinara-app-logs",
    logStreamName: "app-stream",
    limit: 50
  }))

  return res.events || []
})