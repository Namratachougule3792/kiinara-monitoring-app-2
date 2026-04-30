<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const logs = ref([])
const loading = ref(false)
const selectedService = ref(route.query.service || '')
const selectedSchool = ref('')
const schools = ref([])

const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']

const load = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (selectedService.value) params.set('service', selectedService.value)
    if (selectedSchool.value && selectedSchool.value !== 'All') params.set('school', selectedSchool.value)
    logs.value = await $fetch(`/api/logs?${params.toString()}`)
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

const loadSchools = async () => {
  try { schools.value = await $fetch('/api/schools') } catch { schools.value = [] }
}

onMounted(() => { loadSchools(); load() })
watch([selectedService, selectedSchool], load)

const formatTime = (ts) => {
  if (!ts) return '-'
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}

const isError = (log) => typeof log.status === 'number' && log.status >= 400
</script>

<template>
<div class="p-6 bg-[#020617] min-h-screen text-white">

  <div class="mb-6">
    <h1 class="text-xl font-semibold text-white">CloudWatch Logs</h1>
    <p class="text-gray-500 text-sm mt-1">Log group: kiinara-app-logs / app-stream</p>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3 mb-5">
    <select
      v-model="selectedService"
      class="bg-[#0f172a] border border-gray-700 px-3 py-2 rounded text-sm text-white"
    >
      <option value="">All Services</option>
      <option v-for="s in SERVICES" :key="s" :value="s">{{ s }}</option>
    </select>

    <select
      v-model="selectedSchool"
      class="bg-[#0f172a] border border-gray-700 px-3 py-2 rounded text-sm text-white"
    >
      <option value="">All Schools</option>
      <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
    </select>

    <button
      @click="load"
      class="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] border border-gray-700 rounded text-sm transition-colors"
    >
      Refresh
    </button>
  </div>

  <!-- Loading -->
  <div v-if="loading" class="text-gray-500 text-sm py-10 text-center">Fetching logs from CloudWatch...</div>

  <!-- Empty -->
  <div v-else-if="logs.length === 0" class="text-center py-20">
    <p class="text-gray-500">No logs found</p>
    <p class="text-gray-700 text-sm mt-1">Generate events from the Dummy App first</p>
  </div>

  <!-- Log table -->
  <div v-else class="bg-[#0d1117] border border-gray-800 rounded-lg overflow-hidden font-mono text-xs">

    <!-- Table header -->
    <div class="grid bg-[#161b22] border-b border-gray-800 px-4 py-2 text-gray-500 uppercase tracking-wide"
         style="grid-template-columns: 200px 80px 140px 120px 80px 1fr">
      <span>Timestamp</span>
      <span>Status</span>
      <span>School</span>
      <span>Service</span>
      <span>Latency</span>
      <span>Raw</span>
    </div>

    <!-- Log rows -->
    <div
      v-for="(log, i) in logs"
      :key="i"
      class="grid px-4 py-2 border-b border-gray-900 hover:bg-[#0f172a] transition-colors items-start"
      style="grid-template-columns: 200px 80px 140px 120px 80px 1fr"
      :class="isError(log) ? 'border-l-2 border-l-red-600' : 'border-l-2 border-l-green-700'"
    >
      <span class="text-gray-400 tabular-nums">{{ formatTime(log.timestamp) }}</span>
      <span :class="isError(log) ? 'text-red-400' : 'text-green-400'" class="font-bold">
        {{ log.status }}
      </span>
      <span class="text-blue-300 truncate">{{ log.school || '-' }}</span>
      <span class="text-purple-300">{{ log.service || '-' }}</span>
      <span class="text-yellow-300">{{ log.latency ? log.latency + 'ms' : '-' }}</span>
      <span class="text-gray-600 break-all leading-relaxed">{{ log.message }}</span>
    </div>

  </div>

  <p v-if="!loading && logs.length > 0" class="mt-3 text-xs text-gray-700 text-right">
    {{ logs.length }} events from CloudWatch
  </p>

</div>
</template>