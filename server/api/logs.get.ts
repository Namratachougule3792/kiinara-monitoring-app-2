export default defineEventHandler((event) => {
  const service = getQuery(event).service

  return [
    {
      time: new Date(),
      message: `${service} error occurred`
    },
    {
      time: new Date(),
      message: `${service} recovered`
    }
  ]
})