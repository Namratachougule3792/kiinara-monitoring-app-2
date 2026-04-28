<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const logs = ref([])
const loading = ref(true)
const source = ref('supabase')
const selectedService = ref(route.query.service || '')
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
  try { schools.value = await $fetch('/api/schools') } catch (e) { schools.value = [] }
}

onMounted(() => { loadSchools(); load() })
watch([source, selectedService, selectedSchool], load)

const statusLabel = (status) =>
  status === 200 ? '✅ 200 OK' : status === 500 ? '❌ 500 Error' : `${status}`

const statusColor = (status) => status >= 400 ? 'text-red-400' : 'text-green-400'
const formatTime = (ts) => ts ? new Date(ts).toLocaleString() : '-'
</script>

<template>
<div class="p-8 bg-[#020617] min-h-screen text-white">

  <h1 class="text-3xl font-bold mb-6">📋 Logs</h1>

  <div class="flex flex-wrap gap-3 mb-6">

    <div class="flex rounded overflow-hidden border border-gray-700">
      <button
        :class="source === 'supabase' ? 'bg-blue-600' : 'bg-gray-800 text-gray-400'"
        class="px-4 py-2 text-sm"
        @click="source = 'supabase'"
      >Supabase</button>
      <button
        :class="source === 'cloudwatch' ? 'bg-orange-600' : 'bg-gray-800 text-gray-400'"
        class="px-4 py-2 text-sm"
        @click="source = 'cloudwatch'"
      >☁️ CloudWatch</button>
    </div>

    <select v-model="selectedService" class="bg-gray-800 border border-gray-700 p-2 rounded text-sm">
      <option value="">All Services</option>
      <option v-for="s in SERVICES" :key="s" :value="s">{{ s }}</option>
    </select>

    <select
      v-if="source === 'supabase'"
      v-model="selectedSchool"
      class="bg-gray-800 border border-gray-700 p-2 rounded text-sm"
    >
      <option value="">All Schools</option>
      <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
    </select>

  </div>

  <div v-if="loading" class="text-gray-400">Loading logs...</div>

  <div v-else-if="logs.length === 0" class="text-gray-400 text-center mt-20">
    <p class="text-xl">No logs found</p>
    <p class="text-sm mt-2">Generate events from the Dummy App</p>
  </div>

  <div v-else class="space-y-3">
    <div
      v-for="(l, i) in logs"
      :key="l.id || i"
      class="bg-[#1e293b] rounded-lg p-4 border-l-4"
      :class="(l.status >= 400) ? 'border-red-500' : 'border-green-500'"
    >
      <div class="flex justify-between items-start">
        <div>
          <span class="font-semibold text-white">{{ l.service }}</span>
          <span v-if="l.school" class="ml-2 text-gray-400 text-sm">@ {{ l.school }}</span>
        </div>
        <span :class="statusColor(l.status)" class="text-sm font-mono font-bold">
          {{ statusLabel(l.status) }}
        </span>
      </div>
      <div class="flex gap-4 mt-2 text-sm text-gray-400">
        <span>⚡ {{ l.latency }} ms</span>
        <span>🕐 {{ formatTime(l.created_at || l.timestamp) }}</span>
      </div>
    </div>
  </div>

  <p v-if="!loading && logs.length > 0" class="mt-6 text-sm text-gray-500">
    Showing {{ logs.length }} entries from {{ source === 'cloudwatch' ? 'CloudWatch' : 'Supabase' }}
  </p>

</div>
</template>