export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  // Show exactly what runtimeConfig has
  const result: any = {
    runtimeConfigKeys: Object.keys(config),
    awsAccessKeyId: config.awsAccessKeyId ? String(config.awsAccessKeyId).slice(0, 8) + '...' : 'MISSING',
    awsSecretAccessKey: config.awsSecretAccessKey ? 'SET' : 'MISSING',
    awsRegion: config.awsRegion || 'MISSING',
    // Also check raw process.env
    processEnvKeys: Object.keys(process.env).filter(k => k.includes('AWS') || k.includes('MY_')),
    MY_AWS_ACCESS_KEY_ID: process.env.MY_AWS_ACCESS_KEY_ID ? process.env.MY_AWS_ACCESS_KEY_ID.slice(0, 8) + '...' : 'MISSING',
    MY_AWS_REGION: process.env.MY_AWS_REGION || 'MISSING',
    MY_AWS_SECRET_ACCESS_KEY: process.env.MY_AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
  }

  return result
})