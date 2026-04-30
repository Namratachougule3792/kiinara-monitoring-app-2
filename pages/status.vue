<script setup>
import { ref, onMounted } from 'vue'

const overall = ref('Loading')
const services = ref([])
const incidents = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [statusData, incidentData] = await Promise.all([
      $fetch('/api/status'),
      $fetch('/api/incidents')
    ])
    overall.value = statusData.overall || 'Healthy'
    services.value = statusData.services || []
    incidents.value = incidentData.incidents || []
  } catch {
    overall.value = 'Unknown'
  } finally {
    loading.value = false
  }
})

const statusDot = (s) =>
  s === 'Healthy' ? 'bg-green-500' :
  s === 'Degraded' ? 'bg-yellow-400' : 'bg-red-500'

const statusBorder = (s) =>
  s === 'Healthy' ? 'border-green-800' :
  s === 'Degraded' ? 'border-yellow-700' : 'border-red-800'

const overallBg = (s) =>
  s === 'Healthy' ? 'bg-green-950 border-green-800' :
  s === 'Degraded' ? 'bg-yellow-950 border-yellow-800' : 'bg-red-950 border-red-800'

const formatTime = (ts) => ts ? new Date(ts).toLocaleString() : '-'

const incidentBadge = (s) =>
  s === 'Down' ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
</script>

<template>
<div class="p-6 bg-[#020617] min-h-screen text-white">

  <div class="mb-6">
    <h1 class="text-xl font-semibold">Platform Status</h1>
    <p class="text-gray-500 text-sm mt-1">Kiinara OS — Public Health Page · Last 7 days</p>
  </div>

  <div v-if="loading" class="text-gray-500 text-sm">Loading...</div>

  <template v-else>

    <!-- Overall status banner -->
    <div :class="['border rounded-lg p-4 mb-8 flex items-center gap-4', overallBg(overall)]">
      <span :class="['w-3 h-3 rounded-full shrink-0', statusDot(overall)]"/>
      <div>
        <p class="font-semibold text-white">
          {{ overall === 'Healthy' ? 'All Systems Operational' :
             overall === 'Degraded' ? 'Partial Degradation Detected' : 'Major Outage' }}
        </p>
        <p class="text-sm text-gray-400 mt-0.5">Overall status: {{ overall }}</p>
      </div>
    </div>

    <!-- Services -->
    <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Services</h2>
    <div class="space-y-2 mb-10">
      <div v-for="s in services" :key="s.name"
        :class="['bg-[#0f172a] border rounded-lg px-4 py-3 flex justify-between items-center', statusBorder(s.status)]">
        <div class="flex items-center gap-3">
          <span :class="['w-2.5 h-2.5 rounded-full shrink-0', statusDot(s.status)]"/>
          <div>
            <p class="text-sm font-medium text-white">{{ s.name }}</p>
            <p class="text-xs text-gray-600">Uptime: {{ s.uptime }}% · Avg latency: {{ s.avgLatency }}ms</p>
          </div>
        </div>
        <span :class="['px-2 py-0.5 rounded text-xs font-semibold',
          s.status === 'Healthy' ? 'bg-green-900 text-green-300' :
          s.status === 'Degraded' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
        ]">{{ s.status }}</span>
      </div>
    </div>

    <!-- Incident History -->
    <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Incident History</h2>

    <div v-if="incidents.length === 0"
      class="bg-[#0f172a] border border-gray-800 rounded-lg p-8 text-center text-gray-600 text-sm">
      No incidents in the past 7 days
    </div>

    <div v-else class="space-y-3">
      <div v-for="(inc, i) in incidents" :key="i"
        class="bg-[#0f172a] border border-red-900 rounded-lg p-4">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-3">
            <span :class="['px-2 py-0.5 rounded text-xs font-semibold', incidentBadge(inc.status)]">
              {{ inc.status }}
            </span>
            <p class="text-sm font-semibold text-white">{{ inc.service }}</p>
          </div>
          <span :class="['px-2 py-0.5 rounded text-xs font-medium',
            inc.resolved_at ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
          ]">
            {{ inc.resolved_at ? 'Resolved' : 'Ongoing' }}
          </span>
        </div>

        <!-- Human readable summary -->
        <p class="text-sm text-gray-300 mb-3">
          <span class="font-medium text-white">{{ inc.service }}</span>
          {{ inc.status === 'Down' ? ' was down' : ' was degraded' }}
          <template v-if="inc.resolved_at">
            from <span class="text-gray-400">{{ formatTime(inc.started_at) }}</span>
            to <span class="text-gray-400">{{ formatTime(inc.resolved_at) }}</span>
            <span class="text-yellow-400 ml-1">({{ inc.duration }})</span>
          </template>
          <template v-else>
            since <span class="text-gray-400">{{ formatTime(inc.started_at) }}</span>
            <span class="text-red-400 ml-1">({{ inc.duration }})</span>
          </template>
        </p>

        <div class="flex gap-4 text-xs text-gray-600">
          <span>Started: {{ formatTime(inc.started_at) }}</span>
          <span v-if="inc.resolved_at">Resolved: {{ formatTime(inc.resolved_at) }}</span>
          <span v-else class="text-red-500">Not yet resolved</span>
        </div>
      </div>
    </div>

  </template>

</div>
</template>