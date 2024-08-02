<template>
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-xl font-bold mb-2">{{ campaign.title }}</h2>
      <p class="text-gray-600 mb-4">{{ truncateDescription(campaign.description) }}</p>
      <CampaignProgress :current="campaign.currentAmount" :goal="campaign.goalAmount" />
      <div class="flex justify-between items-center mt-4">
        <div>
          <p class="text-sm text-gray-500">Goal: {{ formatCurrency(campaign.goalAmount, campaign.token) }}</p>
          <p class="text-sm text-gray-500">Ends: {{ formatDate(campaign.endDate) }}</p>
        </div>
        <button @click="$emit('contribute', campaign.id)" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Contribute
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { formatCurrency } from '@/composables/currencyFormatter';
  import CampaignProgress from './CampaignProgress.vue';
  
  interface Campaign {
    id: string;
    title: string;
    description: string;
    currentAmount: number;
    goalAmount: number;
    token: string;
    endDate: string;
  }
  
  const props = defineProps<{
    campaign: Campaign;
  }>();
  
  const emit = defineEmits<{
    (e: 'contribute', id: string): void;
  }>();
  
  const truncateDescription = (description: string, length: number = 100) => {
    return description.length > length ? description.substring(0, length) + '...' : description;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  </script>