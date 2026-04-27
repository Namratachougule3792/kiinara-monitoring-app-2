<script setup>
import { ref, onMounted } from 'vue'

const services = ref([])

const fetchData = async () => {
  try {
    const res = await $fetch('/api/health')
    services.value = res
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchData()
  setInterval(fetchData, 5000)
})

const statusColor = (status) => {
  if (status === 'Healthy') return 'bg-green-500'
  if (status === 'Degraded') return 'bg-yellow-400 text-black'
  return 'bg-red-500'
}

const errorRate = (s) => {
  if (!s.requests) return "0"
  return ((s.errors / s.requests) * 100).toFixed(2)
}

const viewLogs = async (service) => {
  const logs = await $fetch('/api/logs')
  console.log("Logs for:", service, logs)
  alert(`Logs printed in console for ${service}`)
}
</script>

<template>
  <div class="p-8 text-white bg-[#020617] min-h-screen">

    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">System Health</h1>
        <p class="text-gray-400 text-sm">Real-time monitoring</p>
      </div>

      <div class="bg-red-500 px-4 py-2 rounded-full text-sm">
        ● Live Monitoring
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">

      <div
        v-for="s in services"
        :key="s.name"
        class="bg-[#1e293b] p-6 rounded-2xl shadow-lg"
      >

        <div class="flex justify-between items-center mb-2">
          <div>
            <h2 class="text-lg font-semibold">{{ s.name }}</h2>
            <p class="text-gray-400 text-sm">
              {{ s.status === 'Healthy' ? 'Operating normally' :
                 s.status === 'Degraded' ? 'Performance issues' :
                 'Service outage' }}
            </p>
          </div>

          <span class="px-3 py-1 rounded-full text-sm"
            :class="statusColor(s.status)">
            {{ s.status }}
          </span>
        </div>

        <div class="grid grid-cols-3 mt-4 text-sm">
          <div>
            <p class="text-gray-400">Requests</p>
            <p>{{ s.requests }}</p>
          </div>

          <div>
            <p class="text-gray-400">Errors</p>
            <p class="text-red-400">{{ s.errors }}</p>
          </div>

          <div>
            <p class="text-gray-400">Latency</p>
            <p class="text-yellow-400">{{ s.latency }} ms</p>
          </div>
        </div>

        <p class="text-red-400 text-sm mt-2">
          Error Rate: {{ errorRate(s) }}%
        </p>

        <!-- VIEW LOGS BUTTON -->
        <button
          v-if="s.status !== 'Healthy'"
          class="mt-4 bg-red-500 px-4 py-2 rounded"
          @click="viewLogs(s.name)"
        >
          View Logs
        </button>

      </div>

    </div>
  </div>
</template>
