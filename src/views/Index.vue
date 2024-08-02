  <template>
    <div class="flex flex-col gap-4 justify-center items-center w-[100dvw] h-[100dvh] text-3xl bg-gradient-to-r from-blue-500 to-teal-400">
      <h1 class="text-4xl font-bold mb-8 text-white">Bono Campaign Management</h1>
      <div class="bg-white p-8 rounded-lg shadow-xl">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="block mb-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {{ link.name }}
        </RouterLink>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const navLinks = ref([
    { name: 'Home', to: { name: 'home' } },
    { name: 'Create Campaign', to: { name: 'create' } },
    { name: 'View Campaigns', to: { name: 'campaigns' } },
    { name: 'High Table Dashboard', to: { name: 'high-table' } },
  ]);
  </script>