<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const logs = ref([])

onMounted(async () => {
  const service = route.query.service

  const data = await $fetch('/api/logs')

  logs.value = service
    ? data.filter(l => l.service === service)
    : data
})
</script>

<template>
<div class="p-8 bg-[#020617] text-white min-h-screen">

<h1 class="text-3xl mb-6">Logs</h1>

<div v-if="logs.length === 0">No logs found</div>

<div v-for="l in logs" :key="l.id" class="mb-3 p-3 bg-[#1e293b] rounded">
  <p><b>{{ l.service }}</b> - {{ l.status }}</p>
  <p>Latency: {{ l.latency }} ms</p>
  <p class="text-xs opacity-70">{{ l.createdAt }}</p>
</div>

</div>
</template>