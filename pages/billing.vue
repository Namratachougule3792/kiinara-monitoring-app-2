<script setup>
import { ref, onMounted, computed } from 'vue'

const data = ref([])

onMounted(async () => {
  data.value = await $fetch('/api/metrics')
})

const totalCost = computed(() =>
  data.value.reduce((a, b) => a + b.cost, 0)
)

const totalReq = computed(() =>
  data.value.reduce((a, b) => a + b.requests, 0)
)
</script>

<template>
<div class="p-8 bg-[#020617] text-white min-h-screen">

<h1 class="text-3xl mb-6">Billing</h1>

<p>Total Cost: ₹{{ totalCost.toFixed(2) }}</p>
<p>Total Requests: {{ totalReq }}</p>

<div v-for="s in data" :key="s.service" class="mt-4">
{{ s.service }} - {{ s.requests }} req - ₹{{ s.cost.toFixed(2) }}
</div>

</div>
</template>
