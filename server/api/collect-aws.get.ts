import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand
} from "@aws-sdk/client-cloudwatch-logs";

import { prisma } from "../db";

export default defineEventHandler(async () => {
  const client = new CloudWatchLogsClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  try {
    const command = new DescribeLogGroupsCommand({});
    const res = await client.send(command);

    const logs = res.logGroups || [];

    for (const log of logs) {
      await prisma.usage.create({
        data: {
          service: log.logGroupName || "unknown",
          requests: Math.floor(Math.random() * 100), // temp for now
          cost: Math.random() * 5
        }
      });
    }

    return { success: true, count: logs.length };
  } catch (err) {
    console.error(err);
    return { error: "Failed to collect AWS data" };
  }
});
