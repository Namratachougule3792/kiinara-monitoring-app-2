<script setup>
import { ref, onMounted } from 'vue'

const overall = ref('Loading...')
const services = ref([])

onMounted(async () => {
  try {
    const health = await $fetch('/api/health')
    const status = await $fetch('/api/status')

    services.value = health
    overall.value = status.overall

  } catch (err) {
    console.error("Status error:", err)
    overall.value = 'Error'
  }
})
</script>

<template>
<div class="p-8 text-white bg-[#020617] min-h-screen">

<h1 class="text-3xl mb-4">Platform Status</h1>

<h2 class="mb-6">
Overall: 
<span :class="overall === 'Healthy' ? 'text-green-400' : 'text-red-400'">
  {{ overall }}
</span>
</h2>

<div class="space-y-2">
  <div v-for="s in services" :key="s.name" class="bg-[#1e293b] p-3 rounded">
    {{ s.name }} - {{ s.status }}
  </div>
</div>

</div>
</template>