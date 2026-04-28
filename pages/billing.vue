<script setup>
import { ref, onMounted, computed } from 'vue'

const services = ref([])
const schools = ref([])
const school = ref('All')
const from = ref('')
const to = ref('')

const load = async () => {
  const res = await $fetch(
    `/api/billing?school=${school.value}&from=${from.value}&to=${to.value}`
  )

  services.value = res.services
  schools.value = res.schools
}

onMounted(load)

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

<div class="flex gap-3 mb-6">

<select v-model="school" @change="load" class="bg-gray-800 p-2 rounded">
  <option>All</option>
  <option v-for="s in schools" :key="s">{{ s }}</option>
</select>

<input type="date" v-model="from" @change="load" class="bg-gray-800 p-2 rounded"/>
<input type="date" v-model="to" @change="load" class="bg-gray-800 p-2 rounded"/>

</div>

<p>Total Cost: ₹{{ totalCost.toFixed(2) }}</p>
<p>Total Requests: {{ totalReq }}</p>

<div v-for="s in services" :key="s.service" class="mt-4 bg-[#1e293b] p-4 rounded">

<div class="flex justify-between">
<p class="font-bold">{{ s.service }}</p>
<p>₹{{ s.cost.toFixed(2) }}</p>
</div>

<p class="text-sm text-gray-400">{{ s.requests }} requests</p>

<div class="w-full bg-gray-700 h-2 mt-2 rounded">
<div 
class="bg-blue-500 h-2 rounded"
:style="{ width: totalReq ? (s.requests / totalReq * 100) + '%' : '0%' }"
></div>
</div>

</div>

</div>
</template>