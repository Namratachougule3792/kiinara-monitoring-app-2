<template>
  <div class="flex bg-[#0B1220] text-white min-h-screen">

    <!-- SIDEBAR -->
    <div class="w-56 bg-[#0F172A] p-5">
      <h1 class="text-white font-bold mb-6">Kiinara OS</h1>

      <nav class="space-y-3 text-gray-300">
        <NuxtLink to="/dashboard" class="block hover:text-white">Health</NuxtLink>
        <NuxtLink to="/billing" class="block hover:text-white">Billing</NuxtLink>
        <NuxtLink to="/status" class="block hover:text-white">Public Status</NuxtLink>
      </nav>
    </div>

    <!-- CONTENT -->
    <div class="flex-1">
      <slot />
    </div>

  </div>
</template>