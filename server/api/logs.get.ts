import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand
} from "@aws-sdk/client-cloudwatch-logs";

export default defineEventHandler(async () => {
  const client = new CloudWatchLogsClient({
    region: process.env.MY_AWS_REGION,
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY as string,
    },
  });

  try {
    const command = new DescribeLogGroupsCommand({});
    const res = await client.send(command);

    return res.logGroups || [];
  } catch (err: any) {
    console.error("CloudWatch FULL ERROR:", err);

    return {
      error: err.message || "Failed to fetch logs"
    };
  }
});
