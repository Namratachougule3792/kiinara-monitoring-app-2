<template>
  <div class="flex">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 class="text-xl font-bold mb-6">Kiinara OS</h2>
      <ul>
        <li class="mb-2"><NuxtLink to="/dashboard">Health</NuxtLink></li>
        <li class="mb-2"><NuxtLink to="/billing">Billing</NuxtLink></li>
        <li class="mb-2"><NuxtLink to="/alerts">Alerts</NuxtLink></li>
      </ul>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6">
      <slot />
    </div>
  </div>
</template>