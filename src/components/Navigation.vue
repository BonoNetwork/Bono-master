<template>
    <nav class="bg-blue-600 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <RouterLink to="/" class="text-2xl font-bold">Bono</RouterLink>
        <div class="space-x-4">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="hover:text-blue-200">
            {{ link.name }}
          </RouterLink>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const navLinks = ref([
    { name: 'Home', to: '/' },
    { name: 'Campaigns', to: '/campaigns' },
    { name: 'Create', to: '/create' },
    { name: 'High Table', to: '/high-table' },
  ]);
  </script>