<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import SpinnerDiamond from '@/components/SpinnerDiamond.vue';
import { useBonoWallet } from '@/composables/useWallet';
import { useCampaign } from '@/composables/useCampaign';
import { useShare } from '@/composables/share';
import { kSupportedTokens } from "@/composables/Tokens";

const router = useRouter();
const { connected, publicKey } = useBonoWallet();

const stage = ref(0);
const createdCampaignId = ref('');

const campaignData = ref({
  title: '',
  description: '',
  goalAmount: 0,
  token: '',
  email: '',
  endDate: ''
});

// Ensure no duplicate name here
const createNewCampaign = async () => {
  if (!connected.value || !publicKey.value) {
    alert('Please connect your wallet first');
    return;
  }

  stage.value = 1;
  try {
    const result = await useCampaign().createCampaign({
      ...campaignData.value,
      walletAddress: publicKey.value.toString()
    });
    createdCampaignId.value = result.id;
    stage.value = 2;
  } catch (error) {
    console.error('Failed to create campaign:', error);
    alert('Failed to create campaign. Please try again.');
    stage.value = 0;
  }
};

const shareCampaign = () => {
  const campaignUrl = `https://app.bono.network/campaign/${createdCampaignId.value}`;
  useShare((url: string) => `https://twitter.com/intent/tweet?url=${url}&text=Check out my new campaign!`, createdCampaignId.value, campaignData.value.title);
};
</script>

<template>
  <div class="w-full min-h-screen bg-gradient-to-r from-blue-500 to-teal-400 py-12">
    <main class="bg-white rounded-lg shadow-xl max-w-4xl mx-auto p-8">
      <h1 class="text-3xl font-bold mb-8 text-center">Create a Campaign</h1>

      <div v-if="stage === 0">
        <form @submit.prevent="createNewCampaign" class="space-y-6">
          <!-- form elements -->
        </form>
      </div>

      <div v-else-if="stage === 1" class="flex justify-center items-center h-64">
        <SpinnerDiamond />
      </div>

      <div v-else-if="stage === 2" class="text-center">
        <h2 class="text-2xl font-bold mb-4">Campaign Created Successfully!</h2>
        <p class="mb-4">Your campaign has been created and is now live. Share it with your network to start receiving contributions!</p>
        <div class="flex justify-center space-x-4">
          <button @click="shareCampaign" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Share Campaign
          </button>
          <router-link :to="{ name: 'campaignDetails', params: { id: createdCampaignId } }" 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            View Campaign
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>
