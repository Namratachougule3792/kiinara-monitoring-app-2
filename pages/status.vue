<script setup>
import { ref, computed, onMounted } from 'vue'

const services = ref([])

onMounted(async () => {
  services.value = await $fetch('/api/health')
})

const overall = computed(() => {
  if (services.value.some(s => s.status === "Down")) return "Down"
  if (services.value.some(s => s.status === "Degraded")) return "Degraded"
  return "Healthy"
})
</script>

<template>
<div class="p-8 text-white bg-[#020617] min-h-screen">

<h1 class="text-3xl mb-4">Platform Status</h1>

<h2 class="mb-6">
Overall: {{ overall }}
</h2>

<div v-for="s in services" :key="s.name">
{{ s.name }} - {{ s.status }}
</div>

</div>
</template>
