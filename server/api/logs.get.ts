import {
  CloudWatchLogsClient,
  GetLogEventsCommand
} from "@aws-sdk/client-cloudwatch-logs";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  const client = new CloudWatchLogsClient({
    region: config.awsRegion?.trim(),
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });

  try {
    const command = new GetLogEventsCommand({
      logGroupName: "kiinara-app-logs",
      logStreamName: "app-stream",
    });

    const res = await client.send(command);

    // parse logs (IMPORTANT)
    const logs = res.events?.map((e: any) => {
      try {
        return JSON.parse(e.message);
      } catch {
        return e.message;
      }
    }) || [];

    return logs;
  } catch (err: any) {
    console.error("AWS ERROR:", err);

    return {
      error: err.message,
      name: err.name
    };
  }
});
