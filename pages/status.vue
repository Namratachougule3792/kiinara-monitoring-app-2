<script setup>
import { ref, onMounted } from 'vue'

const overall = ref('Loading...')
const services = ref([])
const incidents = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch('/api/status')
    overall.value = data.overall || 'Healthy'
    services.value = data.services || []
    incidents.value = data.incidents || []
  } catch (err) {
    overall.value = 'Unknown'
  } finally {
    loading.value = false
  }
})

const statusIcon = (s) => s === 'Healthy' ? '🟢' : s === 'Degraded' ? '🟡' : '🔴'
const statusBg = (s) =>
  s === 'Healthy' ? 'border-green-600' :
  s === 'Degraded' ? 'border-yellow-500' : 'border-red-600'
const statusBadge = (s) =>
  s === 'Healthy' ? 'bg-green-700 text-white' :
  s === 'Degraded' ? 'bg-yellow-600 text-black' : 'bg-red-700 text-white'
</script>

<template>
<div class="p-8 text-white bg-[#020617] min-h-screen">

  <h1 class="text-3xl font-bold mb-2">🌐 Platform Status</h1>
  <p class="text-gray-400 text-sm mb-8">Kiinara OS — Public Health Page · Last 7 days</p>

  <div
    :class="overall === 'Healthy' ? 'bg-green-900/40 border-green-600' : overall === 'Degraded' ? 'bg-yellow-900/40 border-yellow-600' : 'bg-red-900/40 border-red-600'"
    class="border rounded-xl p-5 mb-8 flex items-center gap-4"
  >
    <span class="text-4xl">{{ statusIcon(overall) }}</span>
    <div>
      <p class="font-bold text-xl">
        {{ overall === 'Healthy' ? 'All Systems Operational' :
           overall === 'Degraded' ? 'Partial Degradation' : 'Major Outage' }}
      </p>
      <p class="text-sm text-gray-400">Overall status: <b>{{ overall }}</b></p>
    </div>
  </div>

  <div v-if="loading" class="text-gray-400">Loading...</div>

  <template v-else>
    <h2 class="text-xl font-semibold mb-4">Services</h2>
    <div class="space-y-3 mb-10">
      <div
        v-for="s in services"
        :key="s.name"
        :class="['bg-[#1e293b] p-4 rounded-xl border-l-4 flex justify-between items-center', statusBg(s.status)]"
      >
        <div>
          <p class="font-semibold">{{ statusIcon(s.status) }} {{ s.name }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Uptime: {{ s.uptime }}% · Avg latency: {{ s.avgLatency }}ms</p>
        </div>
        <span :class="['px-3 py-1 rounded-full text-xs font-bold', statusBadge(s.status)]">
          {{ s.status }}
        </span>
      </div>
    </div>

    <h2 class="text-xl font-semibold mb-4">Incident History</h2>
    <div v-if="incidents.length === 0" class="bg-[#1e293b] p-6 rounded-xl text-center text-gray-500">
      🎉 No incidents in the past 7 days
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="inc in incidents"
        :key="inc.id"
        class="bg-[#1e293b] p-4 rounded-xl border-l-4 border-red-500"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-red-400">{{ inc.service }}</p>
            <p class="text-sm text-gray-300">{{ inc.message }}</p>
          </div>
          <span class="text-xs text-gray-500 ml-4 whitespace-nowrap">
            {{ new Date(inc.timestamp).toLocaleString() }}
          </span>
        </div>
        <div class="flex gap-4 text-xs text-gray-500 mt-1">
          <span>Status: {{ inc.status }}</span>
          <span>Latency: {{ inc.latency }}ms</span>
          <span v-if="inc.school">School: {{ inc.school }}</span>
        </div>
      </div>
    </div>
  </template>

</div>
</template>