import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  DescribeLogStreamsCommand
} from "@aws-sdk/client-cloudwatch-logs"

const logGroupName = "kiinara-app-logs"
const logStreamName = "app-stream"

const client = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

//  sequenceToken auto handle
let sequenceToken: string | undefined

export const sendLog = async (message: string) => {
  try {
    // get latest sequence token
    const streams = await client.send(
      new DescribeLogStreamsCommand({
        logGroupName,
        logStreamNamePrefix: logStreamName
      })
    )

    const stream = streams.logStreams?.find(
      s => s.logStreamName === logStreamName
    )

    sequenceToken = stream?.uploadSequenceToken

    const res = await client.send(
      new PutLogEventsCommand({
        logGroupName,
        logStreamName,
        logEvents: [
          {
            message,
            timestamp: Date.now()
          }
        ],
        sequenceToken
      })
    )

    sequenceToken = res.nextSequenceToken

  } catch (err) {
    console.error("CloudWatch ERROR:", err)
  }
}