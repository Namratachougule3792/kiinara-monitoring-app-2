import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand
} from "@aws-sdk/client-cloudwatch-logs";

export default defineEventHandler(async () => {
  const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY;
  const region = process.env.MY_AWS_REGION;

  //  Debug check
  if (!accessKeyId || !secretAccessKey || !region) {
    return {
      error: "ENV variables missing",
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
    console.error("FULL AWS ERROR:", err);

    return {
      error: err.message,
      name: err.name
    };
  }
});
