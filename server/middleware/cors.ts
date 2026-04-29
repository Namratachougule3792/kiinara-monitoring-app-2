export default defineEventHandler((event) => {
  const method = event.node.req.method

  // Set CORS headers on every response
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  })

  // Handle preflight OPTIONS request immediately
  if (method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})