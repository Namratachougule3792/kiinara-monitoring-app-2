import { prisma } from '../../db'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const school = query.school as string

    return await prisma.usage.findMany({
      where: school ? { school } : {}
    })
  } catch (e: any) {
    return { error: e.message }
  }
})