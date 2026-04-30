<template>
  <div class="flex bg-[#020617] text-white min-h-screen">

    <!-- Sidebar -->
    <div class="w-52 bg-[#0a0f1e] border-r border-gray-800 p-5 flex flex-col shrink-0">
      <div class="mb-8">
        <p class="text-white font-bold text-base tracking-tight">Kiinara OS</p>
        <p class="text-gray-600 text-xs mt-0.5">Monitoring Dashboard</p>
      </div>

      <nav class="space-y-1 text-sm text-gray-500 flex-1">
        <NuxtLink to="/dashboard"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Health
        </NuxtLink>

        <NuxtLink to="/logs"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Logs
        </NuxtLink>

        <NuxtLink to="/billing"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Billing
        </NuxtLink>

        <NuxtLink to="/status"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Public Status
        </NuxtLink>
      </nav>
    </div>

    <!-- Main content -->
    <div class="flex-1 overflow-auto">
      <slot />
    </div>

  </div>
</template>