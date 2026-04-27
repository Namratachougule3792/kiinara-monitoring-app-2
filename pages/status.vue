<script setup>
import { computed, onMounted } from 'vue'

/*  FETCH REAL DATA */
const { data, refresh } = await useFetch('/api/health')

/*  AUTO REFRESH */
onMounted(() => {
  setInterval(refresh, 5000)
})

/*  SERVICES FROM API */
const services = computed(() => data.value || [])

/*  GLOBAL STATUS */
const globalStatus = computed(() => {
  if (services.value.some(s => s.status === "Down")) return "outage"
  if (services.value.some(s => s.status === "Degraded")) return "degraded"
  return "healthy"
})

const globalStatusText = computed(() => {
  if (globalStatus.value === "outage") return "Partial outage"
  if (globalStatus.value === "degraded") return "Some issues"
  return "All systems operational"
})

const globalStatusClass = computed(() => {
  if (globalStatus.value === "outage") return "bg-red-600"
  if (globalStatus.value === "degraded") return "bg-yellow-500"
  return "bg-green-600"
})

/*  STATUS COLOR */
const getStatusClass = (s) => {
  if (s === "Healthy") return "bg-green-500/20 text-green-300"
  if (s === "Degraded") return "bg-yellow-500/20 text-yellow-300"
  return "bg-red-500/20 text-red-300"
}

/*  STATUS MESSAGE */
const getMessage = (s) => {
  if (s === "Healthy") return "Operating normally"
  if (s === "Degraded") return "Performance issues"
  return "Service outage"
}
</script>
