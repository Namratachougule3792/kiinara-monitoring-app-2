<script setup>
import { ref, computed } from 'vue'

const school = ref('School A')
const fromDate = ref('')
const toDate = ref('')

const data = ref([
  { service: "Admissions", requests: 1200, cost: 60 },
  { service: "Attendance", requests: 800, cost: 40 },
  { service: "Billing", requests: 600, cost: 30 },
  { service: "Identity", requests: 400, cost: 20 }
])

const totalRequests = computed(() =>
  data.value.reduce((sum, s) => sum + s.requests, 0)
)

const totalCost = computed(() =>
  data.value.reduce((sum, s) => sum + s.cost, 0)
)

const costPerRequest = computed(() =>
  (totalCost.value / totalRequests.value).toFixed(2)
)
</script>

<template>
  <div class="p-6 text-white">

    <!-- TITLE -->
    <h1 class="text-3xl mb-6">Billing & Usage</h1>

    <!-- FILTER BAR -->
    <div class="bg-[#1e293b] p-4 rounded-xl mb-6 flex gap-3 items-center">

      <select v-model="school" class="bg-[#0f172a] p-2 rounded">
        <option>School A</option>
        <option>School B</option>
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
      <div v-for="s in data" :key="s.service" class="bg-[#1e293b] p-5 rounded-xl">

        <div class="flex justify-between mb-2">
          <h2>{{ s.service }}</h2>
          <span>{{ s.requests }} req</span>
        </div>

        <div class="w-full bg-gray-700 h-3 rounded mb-2">
          <div
            class="bg-blue-500 h-3 rounded"
            :style="{ width: (s.requests / totalRequests * 100) + '%' }"
          ></div>
        </div>

        <div class="flex justify-between text-sm">
          <span>{{ ((s.requests / totalRequests) * 100).toFixed(1) }}%</span>
          <span>₹{{ s.cost }}</span>
        </div>
      </div>
    </div>

  </div>
</template>