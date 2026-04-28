<script setup>
import { ref, onMounted, computed } from 'vue'

const services = ref([])
const school = ref('All')
const from = ref('')
const to = ref('')

onMounted(async () => {
  try {
    const data = await $fetch('/api/billing')
    services.value = data.services
  } catch (e) {
    console.error("Billing error:", e)
  }
})

const totalCost = computed(() =>
  services.value.reduce((a, b) => a + b.cost, 0)
)

const totalReq = computed(() =>
  services.value.reduce((a, b) => a + b.requests, 0)
)
</script>

<template>
<div class="p-8 bg-[#020617] text-white min-h-screen">

<h1 class="text-3xl mb-6">Billing & Usage</h1>

<!-- FILTERS -->
<div class="flex gap-3 mb-6">
  <select v-model="school" class="bg-gray-800 p-2 rounded">
    <option>All</option>
    <option>School A</option>
    <option>School B</option>
  </select>

  <input type="date" v-model="from" class="bg-gray-800 p-2 rounded"/>
  <input type="date" v-model="to" class="bg-gray-800 p-2 rounded"/>
</div>

<p>Total Cost: ₹{{ totalCost.toFixed(2) }}</p>
<p>Total Requests: {{ totalReq }}</p>

<!-- SERVICES -->
<div v-for="s in services" :key="s.service" class="mt-4 bg-[#1e293b] p-4 rounded">

  <div class="flex justify-between">
    <p class="font-bold">{{ s.service }}</p>
    <p>₹{{ s.cost }}</p>
  </div>

  <p class="text-sm text-gray-400">{{ s.requests }} requests</p>

  <!-- PROGRESS BAR -->
  <div class="w-full bg-gray-700 h-2 mt-2 rounded">
    <div 
      class="bg-blue-500 h-2 rounded"
      :style="{ width: totalReq ? (s.requests / totalReq * 100) + '%' : '0%' }"
    ></div>
  </div>

</div>

</div>
</template>