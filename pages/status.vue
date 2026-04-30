<script setup>
import { ref, onMounted } from 'vue'

const overall = ref('')
const services = ref([])
const incidents = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await $fetch('/api/status')

    console.log('Status API response:', JSON.stringify(data))

    if (!data) {
      error.value = 'Empty response from /api/status'
      return
    }

    overall.value = data.overall || 'Healthy'
    services.value = data.services || []
    incidents.value = data.incidents || []

    console.log('overall:', overall.value)
    console.log('services count:', services.value.length)
    console.log('incidents count:', incidents.value.length)

  } catch (err) {
    console.error('Status page error:', err)
    error.value = err.message || 'Failed to load status'
    overall.value = 'Unknown'
  } finally {
    loading.value = false
  }
})

const statusDot = (s) =>
  s === 'Healthy' ? 'bg-green-500' :
  s === 'Degraded' ? 'bg-yellow-400' : 'bg-red-500'

const statusBorder = (s) =>
  s === 'Healthy' ? 'border-green-900' :
  s === 'Degraded' ? 'border-yellow-800' : 'border-red-900'

const overallBg = (s) =>
  s === 'Healthy' ? 'bg-green-950 border-green-800' :
  s === 'Degraded' ? 'bg-yellow-950 border-yellow-800' :
  s === 'Down' ? 'bg-red-950 border-red-800' : 'bg-gray-900 border-gray-700'

const overallLabel = (s) =>
  s === 'Healthy' ? 'All Systems Operational' :
  s === 'Degraded' ? 'Partial Degradation Detected' :
  s === 'Down' ? 'Major Outage' : 'Status Unknown'

const badgeClass = (s) =>
  s === 'Healthy' ? 'bg-green-900 text-green-300' :
  s === 'Degraded' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'

const incidentBadge = (s) =>
  s === 'Down'
    ? 'bg-red-900 text-red-300 border border-red-700'
    : 'bg-yellow-900 text-yellow-300 border border-yellow-700'

const formatTime = (ts) => {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}
</script>

<template>
<div class="p-6 bg-[#020617] min-h-screen text-white">

  <div class="mb-6">
    <h1 class="text-xl font-semibold">Platform Status</h1>
    <p class="text-gray-500 text-sm mt-1">Kiinara OS — Public Health Page · Last 7 days</p>
  </div>

  <!-- Loading -->
  <div v-if="loading" class="space-y-4">
    <div class="h-16 bg-gray-900 rounded-lg animate-pulse"/>
    <div class="h-10 bg-gray-900 rounded-lg animate-pulse"/>
    <div class="h-10 bg-gray-900 rounded-lg animate-pulse"/>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="bg-red-950 border border-red-800 rounded-lg p-4 text-red-300 text-sm">
    Failed to load status: {{ error }}
  </div>

  <template v-else>

    <!-- Overall banner -->
    <div :class="['border rounded-lg p-4 mb-8 flex items-center gap-3', overallBg(overall)]">
      <span :class="['w-3 h-3 rounded-full shrink-0', statusDot(overall === 'Down' ? 'Down' : overall)]"/>
      <div>
        <p class="font-semibold text-white">{{ overallLabel(overall) }}</p>
        <p class="text-sm text-gray-400 mt-0.5">Overall status: {{ overall }}</p>
      </div>
    </div>

    <!-- Services -->
    <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Services</h2>

    <div v-if="services.length === 0" class="text-gray-600 text-sm mb-8">
      No service data available
    </div>

    <div v-else class="space-y-2 mb-10">
      <div
        v-for="s in services"
        :key="s.name"
        :class="['bg-[#0f172a] border rounded-lg px-4 py-3 flex justify-between items-center', statusBorder(s.status)]"
      >
        <div class="flex items-center gap-3">
          <span :class="['w-2.5 h-2.5 rounded-full shrink-0', statusDot(s.status)]"/>
          <div>
            <p class="text-sm font-medium text-white">{{ s.name }}</p>
            <p class="text-xs text-gray-600 mt-0.5">
              Uptime: {{ s.uptime }}%
              · Avg latency: {{ s.avgLatency }}ms
              · {{ s.total }} requests
              <span v-if="s.errors > 0" class="text-red-500"> · {{ s.errors }} errors</span>
            </p>
          </div>
        </div>
        <span :class="['px-2.5 py-0.5 rounded text-xs font-semibold', badgeClass(s.status)]">
          {{ s.status }}
        </span>
      </div>
    </div>

    <!-- Incident History -->
    <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Incident History</h2>

    <div
      v-if="incidents.length === 0"
      class="bg-[#0f172a] border border-gray-800 rounded-lg p-8 text-center text-gray-600 text-sm"
    >
      No incidents in the past 7 days
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(inc, i) in incidents"
        :key="i"
        class="bg-[#0f172a] border border-red-900 rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
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

        <!-- Human readable summary line -->
        <p class="text-sm text-gray-300 mb-3">
          <span class="font-medium text-white">{{ inc.service }}</span>
          {{ inc.status === 'Down' ? ' was down' : ' was degraded' }}
          <template v-if="inc.resolved_at">
            from
            <span class="text-gray-400">{{ formatTime(inc.started_at) }}</span>
            to
            <span class="text-gray-400">{{ formatTime(inc.resolved_at) }}</span>
            <span class="text-yellow-400 ml-1">({{ inc.duration }})</span>
          </template>
          <template v-else>
            since
            <span class="text-gray-400">{{ formatTime(inc.started_at) }}</span>
            <span class="text-red-400 ml-1">({{ inc.duration }})</span>
          </template>
        </p>

        <div class="flex flex-wrap gap-4 text-xs text-gray-600">
          <span>Started: {{ formatTime(inc.started_at) }}</span>
          <span v-if="inc.resolved_at">Resolved: {{ formatTime(inc.resolved_at) }}</span>
          <span v-else class="text-red-500">Not yet resolved</span>
          <span v-if="inc.duration">Duration: {{ inc.duration }}</span>
        </div>
      </div>
    </div>

  </template>

</div>
</template>