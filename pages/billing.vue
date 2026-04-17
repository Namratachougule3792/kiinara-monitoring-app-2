<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Billing</h1>

    <!-- Filters -->
    <div class="flex gap-4 mb-4">
      <input placeholder="School" class="border p-2" />
      <input type="month" class="border p-2" />
      <button class="bg-blue-500 text-white px-4">Apply</button>
    </div>

    <!-- Table -->
    <table class="w-full border">
      <thead>
        <tr>
          <th>School</th>
          <th>Usage</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ABC School</td>
          <td>12000</td>
          <td>₹1200</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>