<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const services = ref([])
let intervalId

const load = async () => {
  try {
    services.value = await $fetch('/api/health')
  } catch (e) {
    console.error("Health error:", e)
  }
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

//  REAL LOG PAGE NAVIGATION
const openLogs = (service) => {
  router.push(`/logs?service=${service}`)
}
</script>

<template>
<div class="p-8 bg-[#020617] min-h-screen text-white">

<h1 class="text-3xl mb-6">System Health</h1>

<div class="grid grid-cols-2 gap-6">

<div v-for="s in services" :key="s.name" class="bg-[#1e293b] p-6 rounded">

<h2 class="text-xl mb-2">{{ s.name }}</h2>

<span :class="color(s.status)" class="px-2 py-1 rounded text-sm">
{{ s.status }}
</span>

<p class="mt-2">Requests: {{ s.requests }}</p>
<p>Errors: {{ s.errors }}</p>
<p>Latency: {{ s.latency }} ms</p>

<p class="text-red-400">Error Rate: {{ rate(s) }}%</p>

<!--  BUTTON -->
<button 
  v-if="s.status !== 'Healthy'"
  class="mt-3 px-3 py-1 bg-red-600 rounded hover:bg-red-700"
  @click="openLogs(s.name)"
>
  View Logs
</button>

</div>

</div>
</div>
</template>