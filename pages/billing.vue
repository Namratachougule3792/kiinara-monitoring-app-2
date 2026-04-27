<script setup>
import { ref, computed, onMounted } from 'vue'

/*  FETCH REAL DATA */
const { data: apiData, refresh } = await useFetch('/api/metrics')

/*  AUTO REFRESH */
onMounted(() => {
  setInterval(refresh, 5000)
})

/*  SCHOOL FILTER */
const selectedSchool = ref('')
const fromDate = ref('')
const toDate = ref('')

/*  DATA */
const data = computed(() => apiData.value || [])

/*  EXTRACT UNIQUE SCHOOLS */
const schools = computed(() => {
  const unique = new Set()

  data.value.forEach(d => {
    if (d.school) unique.add(d.school)
  })

  return Array.from(unique)
})

/*  FILTER BY SCHOOL */
const filteredData = computed(() => {
  if (!selectedSchool.value) return data.value
  return data.value.filter(d => d.school === selectedSchool.value)
})

/* CALCULATIONS */
const totalRequests = computed(() =>
  filteredData.value.reduce((sum, s) => sum + (s.requests || 0), 0)
)

const totalCost = computed(() =>
  filteredData.value.reduce((sum, s) => sum + (s.cost || 0), 0)
)

const costPerRequest = computed(() => {
  if (!totalRequests.value) return 0
  return (totalCost.value / totalRequests.value).toFixed(2)
})
</script>

<template>
  <div class="p-6 text-white">

    <!-- TITLE -->
    <h1 class="text-3xl mb-6">Billing & Usage</h1>

    <!-- FILTER BAR -->
    <div class="bg-[#1e293b] p-4 rounded-xl mb-6 flex gap-3 items-center">

      <!-- SCHOOL DROPDOWN -->
      <select v-model="selectedSchool" class="bg-[#0f172a] p-2 rounded">
        <option value="">All Schools</option>
        <option v-for="s in schools" :key="s">
          {{ s }}
        </option>
      </select>

      <input type="date" v-model="fromDate" class="bg-[#0f172a] p-2 rounded"/>
      <input type="date" v-model="toDate" class="bg-[#0f172a] p-2 rounded"/>

      <button class="bg-gray-700 px-3 py-1 rounded">7d</button>
      <button class="bg-gray-700 px-3 py-1 rounded">30d</button>

    </div>

    <!-- TOP CARDS -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-[#1e293b] p-4 rounded-xl">
        <p>Total Cost</p>
        <h2 class="text-xl">₹{{ totalCost }}</h2>
      </div>

      <div class="bg-[#1e293b] p-4 rounded-xl">
        <p>Total Requests</p>
        <h2 class="text-xl">{{ totalRequests }}</h2>
      </div>

      <div class="bg-[#1e293b] p-4 rounded-xl">
        <p>Cost / Request</p>
        <h2 class="text-xl">₹{{ costPerRequest }}</h2>
      </div>

      <div class="bg-[#1e293b] p-4 rounded-xl">
        <p>Efficiency</p>
        <h2 class="text-xl text-blue-400">85/100</h2>
      </div>
    </div>

    <!-- SERVICE BARS -->
    <div class="grid grid-cols-2 gap-6">
      <div
        v-for="s in filteredData"
        :key="s.service"
        class="bg-[#1e293b] p-5 rounded-xl"
      >

        <div class="flex justify-between mb-2">
          <h2>{{ s.service }}</h2>
          <span>{{ s.requests }} req</span>
        </div>

        <div class="w-full bg-gray-700 h-3 rounded mb-2">
          <div
            class="bg-blue-500 h-3 rounded"
            :style="{
              width: totalRequests ? (s.requests / totalRequests * 100) + '%' : '0%'
            }"
          ></div>
        </div>

        <div class="flex justify-between text-sm">
          <span>
            {{ totalRequests ? ((s.requests / totalRequests) * 100).toFixed(1) : 0 }}%
          </span>
          <span>₹{{ s.cost }}</span>
        </div>

      </div>
    </div>

  </div>
</template>
