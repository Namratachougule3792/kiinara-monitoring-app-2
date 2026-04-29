<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const logs = ref([])
const loading = ref(true)
const source = ref(String(route.query.source || 'supabase'))
const selectedService = ref(String(route.query.service || ''))
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

const statusLabel = (status) =>
  Number(status) === 200 ? '✅ 200 OK' :
  Number(status) === 500 ? '❌ 500 Error' : `${status}`

const statusColor = (status) => Number(status) >= 400 ? 'text-red-400' : 'text-green-400'
const borderColor = (status) => Number(status) >= 400 ? 'border-red-500' : 'border-green-500'
const formatTime = (ts) => ts ? new Date(ts).toLocaleString() : '-'
</script>

<template>
<div class="p-8 bg-[#020617] min-h-screen text-white">

  <h1 class="text-3xl font-bold mb-6">📋 Logs</h1>

  <div class="flex flex-wrap gap-3 mb-6">

    <div class="flex rounded-lg overflow-hidden border border-gray-700">
      <button
        :class="source === 'supabase' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'"
        class="px-4 py-2 text-sm font-medium transition-colors"
        @click="source = 'supabase'"
      >🗄️ Supabase</button>
      <button
        :class="source === 'cloudwatch' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'"
        class="px-4 py-2 text-sm font-medium transition-colors"
        @click="source = 'cloudwatch'"
      >☁️ CloudWatch</button>
    </div>

    <select v-model="selectedService" class="bg-gray-800 border border-gray-700 p-2 rounded-lg text-sm text-white">
      <option value="">All Services</option>
      <option v-for="s in SERVICES" :key="s" :value="s">{{ s }}</option>
    </select>

    <select
      v-if="source === 'supabase'"
      v-model="selectedSchool"
      class="bg-gray-800 border border-gray-700 p-2 rounded-lg text-sm text-white"
    >
      <option value="">All Schools</option>
      <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
    </select>

    <button
      @click="load"
      class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
    >🔄 Refresh</button>

  </div>

  <div v-if="loading" class="text-gray-400 flex items-center gap-2">
    <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"/>
    Loading logs...
  </div>

  <div v-else-if="logs.length === 0" class="text-center mt-20">
    <p class="text-xl text-gray-400">No logs found</p>
    <p class="text-sm text-gray-500 mt-2">
      {{ source === 'cloudwatch' ? 'No CloudWatch logs yet — generate events from the Dummy App first' : 'Generate events from the Dummy App to see logs here' }}
    </p>
  </div>

  <div v-else class="space-y-3">
    <div
      v-for="(l, i) in logs"
      :key="l.id || i"
      :class="['bg-[#1e293b] rounded-xl p-4 border-l-4', borderColor(l.status)]"
    >
      <div class="flex justify-between items-start">
        <div>
          <span class="font-semibold text-white text-base">{{ l.service }}</span>
          <span v-if="l.school" class="ml-2 text-gray-400 text-sm">@ {{ l.school }}</span>
        </div>
        <span :class="['text-sm font-mono font-bold', statusColor(l.status)]">
          {{ statusLabel(l.status) }}
        </span>
      </div>
      <div class="flex gap-6 mt-2 text-sm text-gray-400">
        <span>⚡ {{ l.latency }} ms</span>
        <span>🕐 {{ formatTime(l.created_at || l.timestamp) }}</span>
      </div>
    </div>
  </div>

  <p v-if="!loading && logs.length > 0" class="mt-6 text-sm text-gray-500 text-center">
    Showing {{ logs.length }} entries from {{ source === 'cloudwatch' ? '☁️ CloudWatch' : '🗄️ Supabase' }}
  </p>

</div>
</template>