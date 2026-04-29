<template>
  <div class="flex bg-[#0B1220] text-white min-h-screen">
    <div class="w-56 bg-[#0F172A] p-5 flex flex-col border-r border-gray-800">
      <div class="mb-8">
        <h1 class="text-white font-bold text-lg">🚀 Kiinara OS</h1>
        <p class="text-gray-500 text-xs mt-1">Monitoring Dashboard</p>
      </div>
      <nav class="space-y-1 text-gray-400 flex-1">
        <NuxtLink to="/dashboard" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors" active-class="bg-gray-800 text-white">
          📊 Health
        </NuxtLink>
        <NuxtLink to="/logs" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors" active-class="bg-gray-800 text-white">
          📋 Logs
        </NuxtLink>
        <NuxtLink to="/billing" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors" active-class="bg-gray-800 text-white">
          💰 Billing
        </NuxtLink>
        <NuxtLink to="/status" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors" active-class="bg-gray-800 text-white">
          🌐 Public Status
        </NuxtLink>
      </nav>
    </div>
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>