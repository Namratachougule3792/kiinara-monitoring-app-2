import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand
} from "@aws-sdk/client-cloudwatch-logs";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  const accessKeyId = config.awsAccessKeyId;
  const secretAccessKey = config.awsSecretAccessKey;
  const region = config.awsRegion;

  // Debug
  if (!accessKeyId || !secretAccessKey || !region) {
    return {
      error: "ENV variables missing via runtimeConfig",
      debug: {
        accessKeyId: accessKeyId ? "OK" : "MISSING",
        secretAccessKey: secretAccessKey ? "OK" : "MISSING",
        region: region || "MISSING"
      }
    };
  }

  const client = new CloudWatchLogsClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const command = new DescribeLogGroupsCommand({});
    const res = await client.send(command);

    return res.logGroups || [];
  } catch (err: any) {
    console.error("AWS ERROR:", err);

    return {
      error: err.message,
      name: err.name
    };
  }
});
