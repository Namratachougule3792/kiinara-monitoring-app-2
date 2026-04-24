<template>
  <div class="min-h-screen bg-[#0B1220] text-white">

    <div class="max-w-5xl mx-auto px-6 pt-12 pb-6">
      <h1 class="text-4xl font-semibold">Kiinara Platform Status</h1>

      <div :class="globalStatusClass" class="status-pill mt-4">
        ● {{ globalStatusText }}
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-6 pb-12 space-y-4">

      <div v-for="s in services" :key="s.name" class="card">
        <div class="flex justify-between">
          <h2>{{ s.name }}</h2>
          <span :class="getStatusClass(s.status)" class="status-pill">
            {{ s.status }}
          </span>
        </div>

        <p class="text-sm text-gray-400 mt-2">
          {{ getMessage(s.status) }}
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const services = [
  { name: "Admissions", status: "Healthy" },
  { name: "Attendance", status: "Degraded" },
  { name: "Billing", status: "Down" },
  { name: "Identity", status: "Healthy" }
]

const globalStatus = computed(() => {
  if (services.some(s => s.status === "Down")) return "outage"
  if (services.some(s => s.status === "Degraded")) return "degraded"
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

const getStatusClass = (s) => {
  if (s === "Healthy") return "bg-green-500/20 text-green-300"
  if (s === "Degraded") return "bg-yellow-500/20 text-yellow-300"
  return "bg-red-500/20 text-red-300"
}

const getMessage = (s) => {
  if (s === "Healthy") return "Operating normally"
  if (s === "Degraded") return "Performance issues"
  return "Service outage"
}
</script>

<style scoped>
.card {
  @apply bg-[#111827] border border-white/10 rounded-xl p-4;
}
.status-pill {
  @apply px-4 py-1 rounded-full text-xs font-semibold;
}
</style>