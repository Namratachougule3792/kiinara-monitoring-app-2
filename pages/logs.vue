<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const logs = ref([])
const loading = ref(true)
const source = ref((route.query.source as string) || 'supabase')
const selectedService = ref((route.query.service as string) || '')
const selectedSchool = ref('')
const schools = ref([])

const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']

const load = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('source', source.value)
    if (selectedService.value) params.set('service', selectedService.value)
    if (selectedSchool.value && selectedSchool.value !== 'All') params.set('school', selectedSchool.value)
    logs.value = await $fetch(`/api/logs?${params.toString()}`)
  } catch (e) {
    logs.value = []
  } finally {
    loading.value = false
  }
}

const loadSchools = async () => {
  try { schools.value = await $fetch('/api/schools') } catch { schools.value = [] }
}

onMounted(() => { loadSchools(); load() })
watch([source, selectedService, selectedSchool], load)

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toISOString().replace('T', ' ').replace('Z', ' UTC')
}

const statusLabel = (status) => {
  if (status === 200) return '200 OK'
  if (status === 500) return '500 Error'
  if (typeof status === 'number') return `${status}`
  return status || '-'
}

const isError = (log) => {
  if (typeof log.status === 'number') return log.status >= 400
  return false
}

// For CloudWatch source, show raw message JSON nicely
const formatCloudWatchLog = (log) => {
  if (source.value !== 'cloudwatch') return null
  try {
    const parsed = JSON.parse(log.message)
    return parsed
  } catch {
    return null
  }
}
</script>

<template>
<div class="p-6 bg-[#020617] min-h-screen text-white font-mono">

  <div class="flex items-center gap-3 mb-6">
    <span class="text-2xl">📋</span>
    <h1 class="text-2xl font-bold font-sans">Logs</h1>
  </div>

  <!-- Source toggle -->
  <div class="flex flex-wrap gap-3 mb-6">
    <div class="flex rounded overflow-hidden border border-gray-700">
      <button
        :class="source === 'supabase' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'"
        class="px-4 py-2 text-sm font-medium"
        @click="source = 'supabase'"
      >📦 Supabase</button>
      <button
        :class="source === 'cloudwatch' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'"
        class="px-4 py-2 text-sm font-medium"
        @click="source = 'cloudwatch'"
      >☁️ CloudWatch</button>
    </div>

    <select v-model="selectedService" class="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-sm">
      <option value="">All Services</option>
      <option v-for="s in SERVICES" :key="s" :value="s">{{ s }}</option>
    </select>

    <select
      v-if="source === 'supabase'"
      v-model="selectedSchool"
      class="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-sm"
    >
      <option value="">All Schools</option>
      <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
    </select>

    <button
      @click="load"
      class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
    >🔄 Refresh</button>
  </div>

  <div v-if="loading" class="text-gray-400 text-center py-20">Loading logs...</div>

  <div v-else-if="logs.length === 0" class="text-center py-20">
    <p class="text-gray-400 text-lg font-sans">No logs found</p>
    <p class="text-gray-600 text-sm mt-2 font-sans">
      {{ source === 'cloudwatch' ? 'No CloudWatch logs yet — generate events from the Dummy App first' : 'Generate events from the Dummy App to see logs here' }}
    </p>
  </div>

  <!-- CloudWatch style log view -->
  <div v-else-if="source === 'cloudwatch'">
    <div class="bg-[#0d1117] border border-gray-800 rounded-lg overflow-hidden">

      <!-- Header bar like CloudWatch -->
      <div class="bg-[#161b22] px-4 py-2 border-b border-gray-800 flex items-center gap-4 text-xs text-gray-500">
        <span class="w-52">TIMESTAMP</span>
        <span class="w-24">STATUS</span>
        <span class="w-28">SCHOOL</span>
        <span class="w-28">SERVICE</span>
        <span class="w-20">LATENCY</span>
        <span>RAW MESSAGE</span>
      </div>

      <!-- Log rows -->
      <div
        v-for="(log, i) in logs"
        :key="i"
        :class="[
          'px-4 py-2 border-b border-gray-900 flex items-start gap-4 text-xs hover:bg-[#161b22] transition-colors',
          isError(log) ? 'border-l-2 border-l-red-600' : 'border-l-2 border-l-green-700'
        ]"
      >
        <!-- Timestamp -->
        <span class="w-52 text-gray-400 shrink-0 tabular-nums">
          {{ formatTime(log.timestamp) }}
        </span>

        <!-- Status -->
        <span
          :class="isError(log) ? 'text-red-400' : 'text-green-400'"
          class="w-24 shrink-0 font-bold"
        >
          {{ statusLabel(log.status) }}
        </span>

        <!-- School -->
        <span class="w-28 text-blue-300 shrink-0 truncate">
          {{ log.school || '-' }}
        </span>

        <!-- Service -->
        <span class="w-28 text-purple-300 shrink-0">
          {{ log.service || '-' }}
        </span>

        <!-- Latency -->
        <span class="w-20 text-yellow-300 shrink-0">
          {{ log.latency ? log.latency + ' ms' : '-' }}
        </span>

        <!-- Raw JSON message -->
        <span class="text-gray-500 break-all text-xs leading-relaxed">
          {{ log.message }}
        </span>
      </div>

    </div>

    <p class="mt-4 text-xs text-gray-600 text-center">
      ☁️ Showing {{ logs.length }} entries from CloudWatch · Log group: kiinara-app-logs · Stream: app-stream
    </p>
  </div>

  <!-- Supabase style log view (cards) -->
  <div v-else class="space-y-3">
    <div
      v-for="(l, i) in logs"
      :key="l.id || i"
      class="bg-[#1e293b] rounded-lg p-4 border-l-4 font-sans"
      :class="isError(l) ? 'border-red-500' : 'border-green-500'"
    >
      <div class="flex justify-between items-start">
        <div>
          <span class="font-semibold text-white">{{ l.service }}</span>
          <span v-if="l.school" class="ml-2 text-gray-400 text-sm">@ {{ l.school }}</span>
        </div>
        <span
          :class="isError(l) ? 'text-red-400' : 'text-green-400'"
          class="text-sm font-bold"
        >
          {{ isError(l) ? `❌ ${l.status} Error` : `✅ ${l.status} OK` }}
        </span>
      </div>
      <div class="flex gap-4 mt-2 text-sm text-gray-400">
        <span>⚡ {{ l.latency }} ms</span>
        <span>🕐 {{ new Date(l.created_at || l.timestamp).toLocaleString() }}</span>
      </div>
    </div>

    <p class="mt-4 text-xs text-gray-600 text-center font-sans">
      Showing {{ logs.length }} entries from Supabase
    </p>
  </div>

</div>
</template>