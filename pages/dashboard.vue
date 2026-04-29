<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const services = ref([])
const loading = ref(true)
const lastUpdated = ref(null)
let intervalId

const load = async () => {
  try {
    services.value = await $fetch('/api/health')
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (e) {
    console.error('Health error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  intervalId = setInterval(load, 5000)
})
onUnmounted(() => clearInterval(intervalId))

const statusColor = (s) =>
  s === 'Healthy' ? 'bg-green-500 text-white' :
  s === 'Degraded' ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white'

const borderColor = (s) =>
  s === 'Healthy' ? 'border-green-600' :
  s === 'Degraded' ? 'border-yellow-500' : 'border-red-600'

const rate = (s) => s.requests ? ((s.errors / s.requests) * 100).toFixed(1) : '0.0'

// Clicking View Logs opens the Logs page filtered to CloudWatch + that service
const openLogs = (service) => router.push(`/logs?service=${service}&source=cloudwatch`)
</script>

<template>
<div class="p-8 bg-[#020617] min-h-screen text-white">

  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">📊 System Health</h1>
    <div class="text-sm text-gray-400">
      <span v-if="loading">Loading...</span>
      <span v-else>Last updated: {{ lastUpdated }} (auto-refreshes every 5s)</span>
    </div>
  </div>

  <div v-if="loading" class="grid grid-cols-2 gap-6">
    <div v-for="i in 4" :key="i" class="bg-[#1e293b] p-6 rounded-xl animate-pulse h-40"/>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div
      v-for="s in services"
      :key="s.name"
      :class="['bg-[#1e293b] p-6 rounded-xl border-l-4', borderColor(s.status)]"
    >
      <div class="flex justify-between items-start mb-3">
        <h2 class="text-xl font-semibold">{{ s.name }}</h2>
        <span :class="['px-3 py-1 rounded-full text-xs font-bold', statusColor(s.status)]">
          {{ s.status }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-sm text-gray-300">
        <p>📥 Requests: <span class="text-white font-medium">{{ s.requests }}</span></p>
        <p>❌ Errors: <span class="text-red-400 font-medium">{{ s.errors }}</span></p>
        <p>⚡ Latency: <span class="text-white font-medium">{{ s.latency }} ms</span></p>
        <p>📉 Error Rate: <span class="text-red-400 font-medium">{{ rate(s) }}%</span></p>
      </div>

      <!-- View Logs button: only shown when Degraded or Down AND there are requests -->
      <button
        v-if="s.status !== 'Healthy' && s.requests > 0"
        class="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm font-medium transition-colors"
        @click="openLogs(s.name)"
      >
        🔍 View CloudWatch Logs
      </button>
    </div>
  </div>

  <div v-if="!loading && services.every(s => s.requests === 0)" class="text-center text-gray-500 mt-20">
    <p class="text-xl">No activity yet</p>
    <p class="text-sm mt-2">Go to the Dummy App → enter a school name → click Generate</p>
  </div>

</div>
</template>