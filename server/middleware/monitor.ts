import { prisma } from '../db'

export default defineEventHandler(async (event) => {
  const start = Date.now()

  await new Promise((r) => setTimeout(r, Math.random() * 100))

  const latency = Date.now() - start
  const path = event.path

  let service = "Admissions"

  if (path.includes('attendance')) service = "Attendance"
  else if (path.includes('billing')) service = "Billing"
  else if (path.includes('identity')) service = "Identity"

  const isError = Math.random() < 0.3

  await prisma.logs.create({
    data: {
      service,
      latency,
      status: isError ? 500 : 200
    }
  })
})
