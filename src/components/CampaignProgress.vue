<template>
    <div class="w-full">
      <div class="flex justify-between mb-1">
        <span class="text-base font-medium text-blue-700">Progress</span>
        <span class="text-sm font-medium text-blue-700">{{ percentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${percentage}%` }"></div>
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-sm font-medium text-gray-500">{{ formatCurrency(current, 'SOL') }}</span>
        <span class="text-sm font-medium text-gray-500">{{ formatCurrency(goal, 'SOL') }}</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { formatCurrency } from '@/composables/currencyFormatter';
  
  const props = defineProps<{
    current: number;
    goal: number;
  }>();
  
  const percentage = computed(() => {
    return Math.min(Math.round((props.current / props.goal) * 100), 100);
  });
  </script>