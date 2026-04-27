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

    const map: any = {};

    logs.forEach((l: any) => {
      if (!map[l.service]) {
        map[l.service] = {
          name: l.service,
          requests: 0,
          errors: 0,
          latency: 0
        };
      }

      map[l.service].requests++;
      map[l.service].latency += l.latency;

      if (l.status === "Down") {
        map[l.service].errors++;
      }
    });

    return Object.values(map).map((s: any) => {
      const avgLatency = s.requests
        ? Math.floor(s.latency / s.requests)
        : 0;

      let status = "Healthy";
      if (s.errors > 5) status = "Down";
      else if (s.errors > 2) status = "Degraded";

      return {
        ...s,
        latency: avgLatency,
        status
      };
    });

  } catch (err: any) {
    return {
      error: err.message
    };
  }
});
