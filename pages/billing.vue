<script setup>
import { ref, onMounted, computed } from 'vue'

const services = ref([])
const schoolBreakdown = ref([])
const schools = ref([])
const selectedSchool = ref('All')
const from = ref('')
const to = ref('')
const loading = ref(true)
const totalCost = ref(0)
const totalRequests = ref(0)

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
  } catch (e) {
    console.error('Billing error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const maxRequests = computed(() => Math.max(...services.value.map(s => s.requests), 1))
</script>

<template>
<div class="p-8 bg-[#020617] text-white min-h-screen">

  <h1 class="text-3xl font-bold mb-6">💰 Billing & Usage</h1>

  <div class="flex flex-wrap gap-3 mb-8">
    <select v-model="selectedSchool" @change="load" class="bg-gray-800 border border-gray-700 p-2 rounded">
      <option value="All">All Schools</option>
      <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
    </select>
    <input type="date" v-model="from" @change="load" class="bg-gray-800 border border-gray-700 p-2 rounded text-white"/>
    <input type="date" v-model="to" @change="load" class="bg-gray-800 border border-gray-700 p-2 rounded text-white"/>
    <button
      @click="() => { from = ''; to = ''; selectedSchool = 'All'; load() }"
      class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
    >Reset</button>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
    <div class="bg-[#1e293b] p-5 rounded-xl">
      <p class="text-gray-400 text-sm">Total Cost</p>
      <p class="text-3xl font-bold text-green-400">₹{{ totalCost.toFixed(2) }}</p>
    </div>
    <div class="bg-[#1e293b] p-5 rounded-xl">
      <p class="text-gray-400 text-sm">Total Requests</p>
      <p class="text-3xl font-bold text-blue-400">{{ totalRequests }}</p>
    </div>
    <div class="bg-[#1e293b] p-5 rounded-xl">
      <p class="text-gray-400 text-sm">Cost per Request</p>
      <p class="text-3xl font-bold text-purple-400">₹0.05</p>
    </div>
  </div>

  <div v-if="loading" class="text-gray-400">Loading billing data...</div>

  <template v-else>

    <h2 class="text-xl font-semibold mb-4">By Service</h2>
    <div v-if="services.length === 0" class="text-gray-500 mb-8">No data yet</div>
    <div v-else class="space-y-4 mb-8">
      <div v-for="s in services" :key="s.service" class="bg-[#1e293b] p-5 rounded-xl">
        <div class="flex justify-between items-center mb-2">
          <div>
            <span class="font-bold text-lg">{{ s.service }}</span>
            <span v-if="s.errors > 0" class="ml-2 text-xs text-red-400">{{ s.errors }} errors</span>
          </div>
          <div class="text-right">
            <p class="font-bold text-green-400">₹{{ s.cost.toFixed(2) }}</p>
            <p class="text-xs text-gray-400">{{ s.requests }} requests</p>
          </div>
        </div>
        <div class="w-full bg-gray-700 h-2 rounded">
          <div
            class="bg-blue-500 h-2 rounded"
            :style="{ width: (s.requests / maxRequests * 100) + '%' }"
          />
        </div>
      </div>
    </div>

    <div v-if="selectedSchool === 'All' && schoolBreakdown.length > 0">
      <h2 class="text-xl font-semibold mb-4">By School</h2>
      <div class="space-y-3">
        <div
          v-for="s in schoolBreakdown"
          :key="s.school"
          class="bg-[#1e293b] p-4 rounded-lg flex justify-between items-center"
        >
          <div>
            <p class="font-semibold">{{ s.school }}</p>
            <p class="text-xs text-gray-400">{{ s.requests }} requests</p>
          </div>
          <p class="font-bold text-green-400">₹{{ s.cost.toFixed(2) }}</p>
        </div>
      </div>
    </div>

  </template>

</div>
</template>