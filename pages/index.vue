<script setup>
</script>

<template>
  <div class="min-h-screen bg-[#020617] text-white flex items-center justify-center">

    <div class="bg-[#1e293b] p-8 rounded-2xl shadow-lg text-center w-[400px]">

      <h1 class="text-2xl font-bold mb-6">
        🚀 Kiinara Monitoring
      </h1>

      <div class="flex flex-col gap-4">

        <NuxtLink
          to="/dashboard"
          class="bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
        >
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/status"
          class="bg-green-600 hover:bg-green-700 py-2 rounded-lg"
        >
          Status Page
        </NuxtLink>

        <NuxtLink
          to="/billing"
          class="bg-purple-600 hover:bg-purple-700 py-2 rounded-lg"
        >
          Billing & Usage
        </NuxtLink>

      </div>

    </div>

  </div>
</template>
