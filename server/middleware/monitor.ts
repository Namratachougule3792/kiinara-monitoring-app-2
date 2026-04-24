import { prisma } from '../db'

export default defineEventHandler(async (event) => {
  const start = Date.now()

  await new Promise((resolve) => setTimeout(resolve, 1))

  const latency = Date.now() - start
  const path = event.path

  const service = path.includes('billing')
    ? 'Billing'
    : path.includes('attendance')
    ? 'Attendance'
    : path.includes('identity')
    ? 'Identity'
    : 'Admissions'

  try {
    await prisma.logs.create({
      data: {
        service,
        latency,
        status: 200
      }
    })
  } catch (e) {
    console.log("Logging failed")
  }
})