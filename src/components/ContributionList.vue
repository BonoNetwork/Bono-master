<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-2xl font-bold mb-4">Recent Contributions</h2>
    <div v-if="contributions.length > 0">
      <div v-for="contribution in contributions" :key="contribution.id" class="mb-2 p-2 bg-gray-100 rounded">
        <p>
          <strong>{{ contribution.name || 'Anonymous' }}</strong> contributed 
          <strong>{{ contribution.amount }} {{ contribution.currency }}</strong>
        </p>
        <p v-if="contribution.comment" class="text-sm text-gray-600">{{ contribution.comment }}</p>
        <p class="text-xs text-gray-500">{{ formatDate(contribution.date) }}</p>
        <p class="text-xs text-gray-400">{{ formatRelativeTime(contribution.date) }}</p>
      </div>
    </div>
    <div v-else>
      <p>No contributions yet. Be the first to contribute!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { formatDate, formatRelativeTime } from '@/composables/dateFormatter';

const props = defineProps({
  contributions: {
    type: Array as PropType<any[]>,
    required: true
  }
});
</script>