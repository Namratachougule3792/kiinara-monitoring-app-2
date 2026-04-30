import { fetchFromCloudWatch } from '../utils/cloudwatch'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const service = query.service as string | undefined
  const school = query.school as string | undefined

  const logs = await fetchFromCloudWatch({ service, school, limit: 200 })
  return logs
})