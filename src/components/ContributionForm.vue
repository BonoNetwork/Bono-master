<template>
    <form @submit.prevent="handleContribute" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="amount">
          Contribution Amount ({{ campaign.token }})
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="amount"
          type="number"
          step="0.000000001"
          v-model="amount"
          required
        >
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
          Name (optional)
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          v-model="name"
        >
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="comment">
          Comment (optional)
        </label>
        <textarea
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="comment"
          v-model="comment"
        ></textarea>
      </div>
      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          :disabled="!connected"
        >
          Contribute
        </button>
        <p v-if="!connected" class="text-red-500 text-xs italic">Please connect your wallet to contribute.</p>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useBonoWallet } from '@/composables/useWallet';
  import { useCampaign } from '@/composables/useCampaign';
  
  const props = defineProps<{
    campaignId: string;
    campaign: {
      token: string;
    };
  }>();
  
  const { connected, publicKey } = useBonoWallet();
  const { contributeToCampaign } = useCampaign();
  
  const amount = ref(0);
  const name = ref('');
  const comment = ref('');
  
  const handleContribute = async () => {
    if (!connected.value || !publicKey.value) {
      alert('Please connect your wallet');
      return;
    }
  
    try {
      await contributeToCampaign(props.campaignId, {
        amount: amount.value,
        contributorAddress: publicKey.value.toString(),
        name: name.value,
        comment: comment.value
      });
      alert('Contribution successful!');
      // Reset form
      amount.value = 0;
      name.value = '';
      comment.value = '';
    } catch (error) {
      console.error('Contribution failed:', error);
      alert('Contribution failed. Please try again.');
    }
  };
  </script>