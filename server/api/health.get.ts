export default defineEventHandler(() => {
  return {
    summary: {
      total_services: 4,
      operational: 3,
      degraded: 1,
      outage: 0
    },
    services: [
      { name: "Admission", status: "Operational" },
      { name: "Attendance", status: "Degraded" }
    ]
  }
})