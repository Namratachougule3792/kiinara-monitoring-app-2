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

  const res = await client.send(
    new GetLogEventsCommand({
      logGroupName: "kiinara-app-logs",
      logStreamName: "app-stream",
    })
  );

  const logs = res.events?.map((e: any) => JSON.parse(e.message)) || [];

  const map: any = {};

  logs.forEach((l: any) => {
    if (!map[l.service]) {
      map[l.service] = {
        service: l.service,
        requests: 0,
        cost: 0,
        school: l.school
      };
    }

    map[l.service].requests++;

    // simple cost logic
    map[l.service].cost += 0.05;
  });

  return Object.values(map);
});
