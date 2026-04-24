<script setup>
import { ref, onMounted } from 'vue'

const services = ref([])

onMounted(() => {
  services.value = [
    { name: "Admissions", status: "Healthy", requests: 1200, errors: 12, latency: 120 },
    { name: "Attendance", status: "Degraded", requests: 900, errors: 45, latency: 280 },
    { name: "Billing", status: "Down", requests: 300, errors: 120, latency: 900 },
    { name: "Identity", status: "Healthy", requests: 1500, errors: 5, latency: 90 }
  ]
})

const statusColor = (status) => {
  if (status === 'Healthy') return 'bg-green-500'
  if (status === 'Degraded') return 'bg-yellow-400 text-black'
  return 'bg-red-500'
}

const errorRate = (s) => {
  return ((s.errors / s.requests) * 100).toFixed(2)
}

/*  CONTROLLED PATTERN (NOT RANDOM CHAOS) */
const generateBars = (status) => {
  const bars = []

  for (let i = 0; i < 70; i++) {
    if (status === 'Healthy') {
      bars.push(i % 50 === 0 ? 'bg-red-400' : 'bg-green-400')
    }

    else if (status === 'Degraded') {
      if (i % 15 === 0) bars.push('bg-yellow-400')
      else if (i % 40 === 0) bars.push('bg-red-400')
      else bars.push('bg-green-400')
    }

    else {
      if (i % 3 === 0) bars.push('bg-red-400')
      else bars.push('bg-green-400')
    }
  }

  return bars
}
</script>

<template>
  <div class="p-8 text-white bg-[#020617] min-h-screen">

    <!-- HEADER -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">System Health</h1>
        <p class="text-gray-400 text-sm">Real-time monitoring & reliability</p>
      </div>

      <div class="bg-red-500 px-4 py-2 rounded-full text-sm">
        ● System Outage
      </div>
    </div>

    <!-- GRID -->
    <div class="grid grid-cols-2 gap-6">

      <div
        v-for="s in services"
        :key="s.name"
        class="bg-[#1e293b] p-6 rounded-2xl shadow-lg"
      >

        <!-- TITLE -->
        <div class="flex justify-between items-center mb-2">
          <div>
            <h2 class="text-lg font-semibold">{{ s.name }}</h2>
            <p class="text-gray-400 text-sm">
              {{ s.status === 'Healthy' ? 'Operating normally' :
                 s.status === 'Degraded' ? 'Performance issues' :
                 'Service outage' }}
            </p>
          </div>

          <span class="px-3 py-1 rounded-full text-sm"
            :class="statusColor(s.status)">
            {{ s.status }}
          </span>
        </div>

        <!-- METRICS -->
        <div class="grid grid-cols-3 mt-4 text-sm">
          <div>
            <p class="text-gray-400">Requests</p>
            <p>{{ s.requests }}</p>
          </div>

          <div>
            <p class="text-gray-400">Errors</p>
            <p class="text-red-400">{{ s.errors }}</p>
          </div>

          <div>
            <p class="text-gray-400">Latency</p>
            <p class="text-yellow-400">{{ s.latency }} ms</p>
          </div>
        </div>

        <!-- ERROR RATE -->
        <p class="text-red-400 text-sm mt-2">
          Error Rate: {{ errorRate(s) }}%
        </p>

        <!--  EXACT MATCH BARS -->
        <div class="flex items-center gap-[3px] mt-4">
          <div
            v-for="(bar, i) in generateBars(s.status)"
            :key="i"
            class="w-[3px] h-6 rounded-sm"
            :class="bar"
          ></div>
        </div>

        <!-- FOOTER -->
        <div class="flex justify-between text-xs text-gray-400 mt-2">
          <span>90d ago</span>
          <span>
            {{
              s.status === 'Healthy' ? '99.99%' :
              s.status === 'Degraded' ? '97%' : '92%'
            }}
          </span>
          <span>Today</span>
        </div>

      </div>

    </div>
  </div>
</template>