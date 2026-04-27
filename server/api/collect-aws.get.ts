import {
  CloudWatchLogsClient,
  GetLogEventsCommand
} from "@aws-sdk/client-cloudwatch-logs";

import { prisma } from "../db";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  const client = new CloudWatchLogsClient({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });

  try {
    const res = await client.send(
      new GetLogEventsCommand({
        logGroupName: "kiinara-app-logs",
        logStreamName: "app-stream",
      })
    );

    const logs = res.events?.map((e: any) => {
      try {
        return JSON.parse(e.message);
      } catch {
        return null;
      }
    }).filter(Boolean) || [];

    for (const log of logs) {
      await prisma.logs.create({
        data: {
          service: log.service,
          latency: log.latency || 0,
          status: log.status === "Down" ? 500 : 200
        }
      });
    }

    return { success: true, count: logs.length };

  } catch (err: any) {
    return { error: err.message };
  }
});
