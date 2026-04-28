<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const services = ref([])
let intervalId

const transform = (logs) => {
  const map = {}

  logs.forEach(l => {
    if (!map[l.service]) {
      map[l.service] = {
        name: l.service,
        requests: 0,
        errors: 0,
        latency: 0,
        status: "Healthy"
      }
    }

    map[l.service].requests++
    map[l.service].latency += l.latency

    if (l.status === "Down") {
      map[l.service].errors++
    }
  })

  return Object.values(map).map(s => {
    const avgLatency = Math.round(s.latency / s.requests)
    const errorRate = s.errors / s.requests

    let status = "Healthy"
    if (errorRate > 0.3) status = "Down"
    else if (errorRate > 0.1) status = "Degraded"

    return {
      ...s,
      latency: avgLatency,
      status
    }
  })
}

const load = async () => {
  const logs = await $fetch('/api/logs')
  services.value = transform(logs)
}

onMounted(() => {
  load()
  intervalId = setInterval(load, 3000)
})

onUnmounted(() => clearInterval(intervalId))

const color = (s) =>
  s === "Healthy" ? "bg-green-500" :
  s === "Degraded" ? "bg-yellow-400" :
  "bg-red-500"

const rate = (s) =>
  s.requests ? ((s.errors / s.requests) * 100).toFixed(2) : 0
</script>

<template>
<div class="p-8 bg-[#020617] min-h-screen text-white">

<h1 class="text-3xl mb-6">System Health</h1>

<div class="grid grid-cols-2 gap-6">

<div v-for="s in services" :key="s.name" class="bg-[#1e293b] p-6 rounded">

<h2>{{ s.name }}</h2>

<span :class="color(s.status)" class="px-2 py-1 rounded text-sm">
{{ s.status }}
</span>

<p>Requests: {{ s.requests }}</p>
<p>Errors: {{ s.errors }}</p>
<p>Latency: {{ s.latency }} ms</p>

<p class="text-red-400">Error Rate: {{ rate(s) }}%</p>

</div>

</div>
</div>
</template>