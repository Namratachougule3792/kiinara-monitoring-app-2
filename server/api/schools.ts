export default defineEventHandler(async () => {
  const logs = await $fetch('/api/logs')

  return [...new Set(logs.map((l: any) => l.school))]
})