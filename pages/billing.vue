<script setup>
import { ref, onMounted } from 'vue'

const totalCost = ref(0)
const totalRequests = ref(0)
const services = ref([])

onMounted(async () => {
  try {
    const data = await $fetch('/api/billing')

    totalCost.value = data.totalCost
    totalRequests.value = data.totalRequests
    services.value = data.services

  } catch (err) {
    console.error("Billing fetch error:", err)
  }
})
</script>

<template>
<div class="p-8 bg-[#020617] text-white min-h-screen">

<h1 class="text-3xl mb-6">Billing</h1>

<p>Total Cost: ₹{{ totalCost }}</p>
<p>Total Requests: {{ totalRequests }}</p>

<div class="mt-6 space-y-3">
  <div v-for="s in services" :key="s.service" class="bg-[#1e293b] p-4 rounded">
    <p class="font-bold">{{ s.service }}</p>
    <p>Requests: {{ s.requests }}</p>
    <p>Cost: ₹{{ s.cost }}</p>
  </div>
</div>

</div>
</template>