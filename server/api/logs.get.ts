import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand
} from "@aws-sdk/client-cloudwatch-logs";

export default defineEventHandler(async () => {
  const client = new CloudWatchLogsClient({
    region: process.env.AWS_REGION,
  });

  try {
    const command = new DescribeLogGroupsCommand({});
    const res = await client.send(command);

    return res.logGroups;
  } catch (err) {
    console.error("CloudWatch error:", err);
    return { error: "Failed to fetch logs" };
  }
});
