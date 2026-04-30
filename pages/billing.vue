<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const services = ref([])
const schoolBreakdown = ref([])
const schools = ref([])
const selectedSchool = ref('All')
const from = ref('')
const to = ref('')
const loading = ref(true)
const totalCost = ref(0)
const totalRequests = ref(0)
let pollInterval

const COLORS = {
  Admissions: '#3b82f6',
  Attendance: '#10b981',
  Billing:    '#f59e0b',
  Identity:   '#8b5cf6'
}

const quickRange = (days) => {
  const now = new Date()
  to.value = now.toISOString().split('T')[0]
  from.value = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  load()
}

const load = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('school', selectedSchool.value)
    if (from.value) params.set('from', from.value)
    if (to.value) params.set('to', to.value)
    const res = await $fetch(`/api/billing?${params.toString()}`)
    services.value = res.services || []
    schoolBreakdown.value = res.schoolBreakdown || []
    schools.value = res.schools || []
    totalCost.value = res.totalCost || 0
    totalRequests.value = res.totalRequests || 0
  } catch { } finally {
    loading.value = false
  }
}

const pollSchools = async () => {
  try {
    const s = await $fetch('/api/schools')
    if (JSON.stringify(s) !== JSON.stringify(schools.value)) {
      schools.value = s
      load()
    }
  } catch (_) {}
}

onMounted(() => { load(); pollInterval = setInterval(pollSchools, 10000) })
onUnmounted(() => clearInterval(pollInterval))

const efficiencyScore = computed(() => {
  if (!totalRequests.value) return 100
  const errors = services.value.reduce((a, s) => a + (s.errors || 0), 0)
  return Math.round(((totalRequests.value - errors) / totalRequests.value) * 100)
})

// Pie chart math
const PIE_SIZE = 200
const PIE_CENTER = PIE_SIZE / 2
const PIE_RADIUS = 80
const PIE_CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS

const pieSlices = computed(() => {
  const total = services.value.reduce((a, s) => a + s.requests, 0)
  if (total === 0) return []

  let offset = 0
  return services.value
    .filter(s => s.requests > 0)
    .map(s => {
      const pct = s.requests / total
      const dash = pct * PIE_CIRCUMFERENCE
      const gap = PIE_CIRCUMFERENCE - dash
      const slice = { service: s.service, pct, dash, gap, offset, color: COLORS[s.service] || '#64748b' }
      offset += dash
      return slice
    })
})

const maxRequests = computed(() => Math.max(...services.value.map(s => s.requests), 1))
</script>

<template>
<div class="p-6 bg-[#020617] text-white min-h-screen">

  <div class="mb-6">
    <h1 class="text-xl font-semibold">Billing & Usage</h1>
    <p class="text-gray-500 text-sm mt-1">Cost tracking across all schools and services</p>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3 mb-6 items-center">
    <select v-model="selectedSchool" @change="load"
      class="bg-[#0f172a] border border-gray-700 px-3 py-2 rounded text-sm text-white min-w-[160px]">
      <option value="All">All Schools</option>
      <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
    </select>
    <input type="date" v-model="from" @change="load"
      class="bg-[#0f172a] border border-gray-700 px-3 py-2 rounded text-white text-sm" />
    <span class="text-gray-600 text-sm">to</span>
    <input type="date" v-model="to" @change="load"
      class="bg-[#0f172a] border border-gray-700 px-3 py-2 rounded text-white text-sm" />
    <button @click="quickRange(7)" class="px-3 py-2 bg-[#1e293b] border border-gray-700 hover:bg-[#334155] rounded text-xs transition-colors">Last 7d</button>
    <button @click="quickRange(30)" class="px-3 py-2 bg-[#1e293b] border border-gray-700 hover:bg-[#334155] rounded text-xs transition-colors">Last 30d</button>
    <button @click="() => { from = ''; to = ''; selectedSchool = 'All'; load() }"
      class="px-3 py-2 bg-[#1e293b] border border-gray-700 hover:bg-[#334155] rounded text-xs transition-colors">Reset</button>
  </div>

  <!-- Summary cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-[#0f172a] border border-gray-800 p-5 rounded-lg">
      <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">Total Cost</p>
      <p class="text-2xl font-bold text-green-400">₹{{ totalCost.toFixed(2) }}</p>
    </div>
    <div class="bg-[#0f172a] border border-gray-800 p-5 rounded-lg">
      <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">Total Requests</p>
      <p class="text-2xl font-bold text-blue-400">{{ totalRequests }}</p>
    </div>
    <div class="bg-[#0f172a] border border-gray-800 p-5 rounded-lg">
      <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">Cost / Request</p>
      <p class="text-2xl font-bold text-purple-400">₹0.05</p>
    </div>
    <div class="bg-[#0f172a] border border-gray-800 p-5 rounded-lg">
      <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">Efficiency</p>
      <p class="text-2xl font-bold"
        :class="efficiencyScore >= 80 ? 'text-green-400' : efficiencyScore >= 50 ? 'text-yellow-400' : 'text-red-400'">
        {{ efficiencyScore }}%
      </p>
    </div>
  </div>

  <div v-if="loading" class="text-gray-500 text-center py-20 text-sm">Loading billing data...</div>

  <template v-else>

    <!-- Pie chart + service list side by side -->
    <div class="bg-[#0f172a] border border-gray-800 rounded-lg p-6 mb-6">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Service Distribution</h2>

      <div v-if="!services.some(s => s.requests > 0)" class="text-gray-600 text-center py-10 text-sm">
        No data for selected range
      </div>

      <div v-else class="flex flex-col md:flex-row items-center gap-10">

        <!-- Pie chart -->
        <div class="shrink-0">
          <svg :width="PIE_SIZE" :height="PIE_SIZE" :viewBox="`0 0 ${PIE_SIZE} ${PIE_SIZE}`">
            <!-- Background circle -->
            <circle
              :cx="PIE_CENTER" :cy="PIE_CENTER" :r="PIE_RADIUS"
              fill="none" stroke="#1e293b" :stroke-width="36"
            />
            <!-- Slices -->
            <circle
              v-for="(slice, i) in pieSlices"
              :key="i"
              :cx="PIE_CENTER" :cy="PIE_CENTER" :r="PIE_RADIUS"
              fill="none"
              :stroke="slice.color"
              :stroke-width="36"
              :stroke-dasharray="`${slice.dash} ${slice.gap}`"
              :stroke-dashoffset="-slice.offset + PIE_CIRCUMFERENCE * 0.25"
              style="transition: all 0.4s ease"
            />
            <!-- Center text -->
            <text :x="PIE_CENTER" :y="PIE_CENTER - 6" text-anchor="middle" fill="white" font-size="20" font-weight="bold">
              {{ totalRequests }}
            </text>
            <text :x="PIE_CENTER" :y="PIE_CENTER + 14" text-anchor="middle" fill="#64748b" font-size="10">
              requests
            </text>
          </svg>
        </div>

        <!-- Legend + stats -->
        <div class="flex-1 space-y-3 w-full">
          <div v-for="s in services" :key="s.service"
            class="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-gray-900">
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full shrink-0" :style="{ background: COLORS[s.service] || '#64748b' }"/>
              <div>
                <p class="text-sm font-medium text-white">{{ s.service }}</p>
                <p class="text-xs text-gray-600">
                  {{ s.requests }} requests ·
                  {{ totalRequests ? ((s.requests / totalRequests) * 100).toFixed(1) : 0 }}%
                  <span v-if="s.errors > 0" class="text-red-500 ml-1">· {{ s.errors }} errors</span>
                </p>
              </div>
            </div>
            <p class="text-sm font-semibold text-green-400">₹{{ s.cost.toFixed(2) }}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Per school breakdown -->
    <div v-if="selectedSchool === 'All' && schoolBreakdown.length > 0"
      class="bg-[#0f172a] border border-gray-800 rounded-lg p-6">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">By School</h2>
      <div class="space-y-2">
        <div v-for="s in schoolBreakdown" :key="s.school"
          class="flex justify-between items-center p-3 bg-[#0d1117] rounded border border-gray-900">
          <div>
            <p class="text-sm font-medium">{{ s.school }}</p>
            <p class="text-xs text-gray-600">{{ s.requests }} requests</p>
          </div>
          <p class="text-sm font-semibold text-green-400">₹{{ s.cost.toFixed(2) }}</p>
        </div>
      </div>
    </div>

  </template>

</div>
</template>