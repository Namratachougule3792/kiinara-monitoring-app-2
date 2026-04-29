<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const services = ref([])
const schoolBreakdown = ref([])
const schools = ref([])
const chartData = ref([])
const selectedSchool = ref('All')
const from = ref('')
const to = ref('')
const loading = ref(true)
const totalCost = ref(0)
const totalRequests = ref(0)
const efficiency = ref(100)
let intervalId

const COLORS = {
  Admissions: '#3b82f6',
  Attendance: '#10b981',
  Billing: '#f59e0b',
  Identity: '#8b5cf6'
}

const SERVICES = ['Admissions', 'Attendance', 'Billing', 'Identity']

const load = async () => {
  try {
    const params = new URLSearchParams()
    params.set('school', selectedSchool.value)
    if (from.value) params.set('from', from.value)
    if (to.value) params.set('to', to.value)

    const res = await $fetch(`/api/billing?${params.toString()}`)
    services.value = res.services || []
    schoolBreakdown.value = res.schoolBreakdown || []
    chartData.value = res.chartData || []
    totalCost.value = res.totalCost || 0
    totalRequests.value = res.totalRequests || 0
    efficiency.value = res.efficiency ?? 100

    // Merge new schools into dropdown without losing current selection
    const newSchools = res.schools || []
    const existing = new Set(schools.value)
    newSchools.forEach((s) => { if (!existing.has(s)) schools.value.push(s) })
    schools.value.sort()
  } catch (e) {
    console.error('Billing error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  intervalId = setInterval(load, 8000) // real-time refresh every 8s
})
onUnmounted(() => clearInterval(intervalId))
watch([selectedSchool, from, to], load)

const maxRequests = computed(() => Math.max(...services.value.map(s => s.requests), 1))

// Quick date filter helpers
const setQuick = (days) => {
  const now = new Date()
  const past = new Date(now)
  past.setDate(past.getDate() - days)
  from.value = past.toISOString().split('T')[0]
  to.value = now.toISOString().split('T')[0]
}

// SVG chart helpers
const chartWidth = 700
const chartHeight = 200
const chartPad = { top: 10, right: 20, bottom: 30, left: 40 }

const chartInnerW = computed(() => chartWidth - chartPad.left - chartPad.right)
const chartInnerH = computed(() => chartHeight - chartPad.top - chartPad.bottom)

const maxY = computed(() => {
  let m = 0
  chartData.value.forEach(d => {
    SERVICES.forEach(s => { if ((d[s] || 0) > m) m = d[s] })
  })
  return m || 5
})

const xScale = (i) => {
  if (chartData.value.length < 2) return chartPad.left + chartInnerW.value / 2
  return chartPad.left + (i / (chartData.value.length - 1)) * chartInnerW.value
}
const yScale = (v) => chartPad.top + chartInnerH.value - (v / maxY.value) * chartInnerH.value

const linePath = (service) => {
  if (!chartData.value.length) return ''
  return chartData.value.map((d, i) => {
    const x = xScale(i)
    const y = yScale(d[service] || 0)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

const xLabels = computed(() => {
  if (!chartData.value.length) return []
  const step = Math.max(1, Math.floor(chartData.value.length / 6))
  return chartData.value
    .map((d, i) => ({ i, label: d.time ? new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }))
    .filter((_, i) => i % step === 0)
})
</script>

<template>
<div class="p-6 bg-[#020617] text-white min-h-screen">

  <h1 class="text-3xl font-bold mb-6">💰 Billing & Usage</h1>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3 mb-6 items-center">
    <select
      v-model="selectedSchool"
      class="bg-gray-800 border border-gray-700 p-2 rounded-lg text-sm text-white min-w-[140px]"
    >
      <option value="All">All Schools</option>
      <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
    </select>

    <input type="date" v-model="from" class="bg-gray-800 border border-gray-700 p-2 rounded-lg text-sm text-white"/>
    <input type="date" v-model="to" class="bg-gray-800 border border-gray-700 p-2 rounded-lg text-sm text-white"/>

    <button @click="setQuick(7)" class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">Last 7d</button>
    <button @click="setQuick(30)" class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">Last 30d</button>
    <button @click="() => { from = ''; to = ''; selectedSchool = 'All' }" class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">Reset</button>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-[#1e293b] p-5 rounded-xl">
      <p class="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Cost</p>
      <p class="text-3xl font-bold text-green-400">₹{{ totalCost.toFixed(2) }}</p>
    </div>
    <div class="bg-[#1e293b] p-5 rounded-xl">
      <p class="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Requests</p>
      <p class="text-3xl font-bold text-blue-400">{{ totalRequests }}</p>
    </div>
    <div class="bg-[#1e293b] p-5 rounded-xl">
      <p class="text-gray-400 text-xs uppercase tracking-wider mb-1">Cost / Request</p>
      <p class="text-3xl font-bold text-purple-400">₹0.05</p>
    </div>
    <div class="bg-[#1e293b] p-5 rounded-xl">
      <p class="text-gray-400 text-xs uppercase tracking-wider mb-1">Efficiency</p>
      <p class="text-3xl font-bold" :class="efficiency > 80 ? 'text-green-400' : efficiency > 50 ? 'text-yellow-400' : 'text-red-400'">
        {{ efficiency }}%
      </p>
    </div>
  </div>

  <div v-if="loading" class="text-gray-400 text-center py-10">Loading billing data...</div>

  <template v-else>

    <!-- Usage Chart -->
    <div class="bg-[#1e293b] rounded-xl p-5 mb-8">
      <h2 class="text-lg font-semibold mb-4">📈 Usage Over Time</h2>

      <div v-if="chartData.length === 0" class="text-gray-500 text-center py-8">
        No chart data yet — generate events from the Dummy App
      </div>

      <div v-else class="overflow-x-auto">
        <!-- Legend -->
        <div class="flex gap-4 mb-3 flex-wrap">
          <div v-for="s in SERVICES" :key="s" class="flex items-center gap-1 text-xs">
            <div class="w-3 h-3 rounded-full" :style="{ background: COLORS[s] }"/>
            {{ s }}
          </div>
        </div>

        <!-- SVG Line Chart -->
        <svg :width="chartWidth" :height="chartHeight" class="overflow-visible">
          <!-- Grid lines -->
          <line
            v-for="i in 5"
            :key="i"
            :x1="chartPad.left"
            :x2="chartWidth - chartPad.right"
            :y1="chartPad.top + (chartInnerH / 5) * (i - 1)"
            :y2="chartPad.top + (chartInnerH / 5) * (i - 1)"
            stroke="#334155" stroke-width="1"
          />

          <!-- Y axis labels -->
          <text
            v-for="i in 6"
            :key="'y'+i"
            :x="chartPad.left - 5"
            :y="chartPad.top + (chartInnerH / 5) * (i - 1) + 4"
            fill="#64748b" font-size="10" text-anchor="end"
          >{{ Math.round(maxY * (1 - (i-1)/5)) }}</text>

          <!-- Lines per service -->
          <path
            v-for="s in SERVICES"
            :key="s"
            :d="linePath(s)"
            :stroke="COLORS[s]"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Dots per service per point -->
          <template v-for="s in SERVICES" :key="'dots-'+s">
            <circle
              v-for="(d, i) in chartData"
              :key="i"
              :cx="xScale(i)"
              :cy="yScale(d[s] || 0)"
              r="3"
              :fill="COLORS[s]"
            />
          </template>

          <!-- X axis labels -->
          <text
            v-for="item in xLabels"
            :key="'xl'+item.i"
            :x="xScale(item.i)"
            :y="chartHeight - 5"
            fill="#64748b" font-size="9" text-anchor="middle"
          >{{ item.label }}</text>
        </svg>
      </div>
    </div>

    <!-- Per Service Breakdown -->
    <h2 class="text-xl font-semibold mb-4">By Service</h2>
    <div v-if="!services.some(s => s.requests > 0)" class="text-gray-500 mb-8">No data yet</div>
    <div v-else class="space-y-4 mb-8">
      <div v-for="s in services" :key="s.service" class="bg-[#1e293b] p-5 rounded-xl">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ background: COLORS[s.service] }"/>
            <span class="font-bold text-lg">{{ s.service }}</span>
            <span v-if="s.errors > 0" class="text-xs text-red-400 bg-red-900 px-2 py-0.5 rounded-full">
              {{ s.errors }} errors
            </span>
          </div>
          <div class="text-right">
            <p class="font-bold text-green-400 text-lg">₹{{ s.cost.toFixed(2) }}</p>
            <p class="text-xs text-gray-400">{{ s.requests }} requests · {{ totalRequests ? ((s.requests / totalRequests) * 100).toFixed(1) : 0 }}%</p>
          </div>
        </div>
        <div class="w-full bg-gray-700 h-2 rounded-full">
          <div
            class="h-2 rounded-full transition-all"
            :style="{
              width: (s.requests / maxRequests * 100) + '%',
              background: COLORS[s.service]
            }"
          />
        </div>
      </div>
    </div>

    <!-- Per School Breakdown -->
    <div v-if="selectedSchool === 'All' && schoolBreakdown.length > 0">
      <h2 class="text-xl font-semibold mb-4">By School</h2>
      <div class="space-y-3">
        <div
          v-for="s in schoolBreakdown"
          :key="s.school"
          class="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center"
        >
          <div>
            <p class="font-semibold text-white">🏫 {{ s.school }}</p>
            <p class="text-xs text-gray-400">{{ s.requests }} requests</p>
          </div>
          <p class="font-bold text-green-400 text-lg">₹{{ s.cost.toFixed(2) }}</p>
        </div>
      </div>
    </div>

  </template>

</div>
</template>