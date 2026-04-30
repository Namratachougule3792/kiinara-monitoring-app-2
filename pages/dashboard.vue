<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const services = ref([])
const loading = ref(true)
const lastUpdated = ref('')
let intervalId

const load = async () => {
  try {
    services.value = await $fetch('/api/health')
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch { } finally {
    loading.value = false
  }
}

onMounted(() => { load(); intervalId = setInterval(load, 5000) })
onUnmounted(() => clearInterval(intervalId))

const borderColor = (s) =>
  s === 'Healthy' ? 'border-green-800' :
  s === 'Degraded' ? 'border-yellow-700' : 'border-red-800'

const badgeClass = (s) =>
  s === 'Healthy' ? 'bg-green-900 text-green-300' :
  s === 'Degraded' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'

const dotClass = (s) =>
  s === 'Healthy' ? 'bg-green-500' :
  s === 'Degraded' ? 'bg-yellow-400' : 'bg-red-500'

const rate = (s) => s.requests ? ((s.errors / s.requests) * 100).toFixed(1) : '0.0'
const viewLogs = (name) => router.push(`/logs?service=${name}`)
</script>

<template>
<div class="p-6 bg-[#020617] min-h-screen text-white">

  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-xl font-semibold">System Health</h1>
      <p class="text-gray-500 text-sm mt-1">Last 24 hours · auto-refreshes every 5s</p>
    </div>
    <p class="text-xs text-gray-600">Updated {{ lastUpdated }}</p>
  </div>

  <!-- Loading skeleton -->
  <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div v-for="i in 4" :key="i" class="bg-[#0f172a] border border-gray-800 rounded-lg h-36 animate-pulse"/>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div v-for="s in services" :key="s.name"
      :class="['bg-[#0f172a] border-l-4 border border-gray-800 rounded-lg p-5', borderColor(s.status)]">

      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-2.5">
          <span :class="['w-2.5 h-2.5 rounded-full', dotClass(s.status)]"/>
          <h2 class="text-base font-semibold">{{ s.name }}</h2>
        </div>
        <span :class="['px-2.5 py-0.5 rounded text-xs font-semibold', badgeClass(s.status)]">
          {{ s.status }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-y-2 text-sm text-gray-400 mb-4">
        <p>Requests <span class="text-white font-medium ml-1">{{ s.requests }}</span></p>
        <p>Errors <span class="text-red-400 font-medium ml-1">{{ s.errors }}</span></p>
        <p>Latency <span class="text-white font-medium ml-1">{{ s.latency }}ms</span></p>
        <p>Error Rate <span class="text-red-400 font-medium ml-1">{{ rate(s) }}%</span></p>
      </div>

      <button v-if="s.status !== 'Healthy'"
        @click="viewLogs(s.name)"
        class="w-full py-1.5 bg-red-900 hover:bg-red-800 border border-red-700 rounded text-xs font-medium text-red-300 transition-colors">
        View CloudWatch Logs
      </button>
    </div>
  </div>

  <div v-if="!loading && services.every(s => s.requests === 0)"
    class="text-center text-gray-600 text-sm mt-16">
    No activity yet — go to the Dummy App, enter a school name, and click Generate
  </div>

</div>
</template>