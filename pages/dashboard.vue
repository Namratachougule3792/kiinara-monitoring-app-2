<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Health Dashboard</h1>

    <div v-for="service in services" :key="service.name" class="mb-4 p-4 border">
      <div class="flex justify-between">
        <span>{{ service.name }}</span>
        <span>{{ service.status }}</span>
      </div>

      <!-- Segmented bar -->
      <div class="flex mt-2">
        <div v-for="i in 10" :key="i"
             :class="[
               'w-4 h-4 mr-1',
               service.status === 'Healthy' ? 'bg-green-500' :
               service.status === 'Degraded' ? 'bg-yellow-500' :
               'bg-red-500'
             ]">
        </div>
      </div>

      <button v-if="service.status !== 'Healthy'"
              class="mt-2 px-3 py-1 bg-blue-500 text-white">
        View Logs
      </button>
    </div>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/health')

const services = [
  { name: 'Admission', status: 'Healthy' },
  { name: 'Attendance', status: 'Degraded' },
  { name: 'Billing', status: 'Down' },
  { name: 'Identity', status: 'Healthy' }
]
</script>