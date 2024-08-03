<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-500 to-teal-400 py-12">
    <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="p-8">
        <h1 class="text-3xl font-bold mb-4">{{ currentCampaign?.title }}</h1>
        <p class="text-gray-600 mb-6">{{ currentCampaign?.description }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Case Statistics</h2>
            <p><strong>Balance:</strong> {{ currentCampaign?.stats?.balance }} {{ currentCampaign?.stats?.currency }}</p>
            <p><strong>Withdrawn:</strong> {{ currentCampaign?.stats?.withdrawn }} {{ currentCampaign?.stats?.currency }}</p>
            <p><strong>Goal:</strong> {{ currentCampaign?.stats?.goal }} {{ currentCampaign?.stats?.currency }}</p>
            <p><strong>Case Owner:</strong> {{ currentCampaign?.stats?.caseOwner }}</p>
            <p><strong>Legal Firm:</strong> {{ currentCampaign?.stats?.legalFirm }}</p>
            <p><strong>Status:</strong> {{ currentCampaign?.stats?.status }}</p>
            <p><strong>High Table Approval:</strong> {{ currentCampaign?.stats?.highTableApproval }}</p>
          </div>
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Case Details</h2>
            <p><strong>Incident Date:</strong> {{ currentCampaign?.caseDetails?.incidentDate }}</p>
            <p><strong>Jurisdiction:</strong> {{ currentCampaign?.caseDetails?.jurisdiction }}</p>
            <p><strong>Case Type:</strong> {{ currentCampaign?.caseDetails?.caseType }}</p>
            <p><strong>Evidence Summary:</strong> {{ currentCampaign?.caseDetails?.evidenceSummary }}</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Legal Update</h2>
          <div class="bg-blue-100 p-6 rounded-lg">
            <p><strong>Last Update:</strong> {{ currentCampaign?.legalUpdate?.lastUpdate }}</p>
            <p><strong>Status:</strong> {{ currentCampaign?.legalUpdate?.status }}</p>
            <p><strong>Next Steps:</strong> {{ currentCampaign?.legalUpdate?.nextSteps }}</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">{{ currentCampaign?.contribution?.title }}</h2>
          <p class="text-sm text-gray-600 mb-4">{{ currentCampaign?.contribution?.fee }}</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              v-for="option in currentCampaign?.contribution?.options"
              :key="option.id"
              @click="selectContributionAmount(option.amount)"
              class="p-4 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p class="font-bold">{{ option.title }}</p>
              <p class="text-sm text-gray-600">{{ option.description }}</p>
            </button>
          </div>
          <div class="mb-4">
            <input
              v-model="contributorName"
              :placeholder="currentCampaign?.contribution?.field1Placeholder"
              class="w-full p-2 border rounded-lg"
            />
          </div>
          <div class="mb-4">
            <textarea
              v-model="contributorComment"
              :placeholder="currentCampaign?.contribution?.field2Placeholder"
              class="w-full p-2 border rounded-lg"
              rows="3"
            ></textarea>
          </div>
          <button
            @click="contribute"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {{ currentCampaign?.contribution?.buttonText }}
          </button>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">{{ currentCampaign?.contribution?.contributionsText }}</h2>
          <div class="bg-gray-100 p-4 rounded-lg">
            <!-- Add a list of recent contributions here -->
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Share This Case</h2>
          <div class="flex space-x-4">
            <button
              v-for="btn in currentCampaign?.shareTo.btns"
              :key="btn.text"
              @click="share(btn.actionLink)"
              class="py-2 px-4 rounded-lg text-white"
              :style="{ backgroundColor: btn.bgColor }"
            >
              {{ btn.text }}
            </button>
          </div>
        </div>

        <div class="text-sm text-gray-600" v-html="currentCampaign?.legalDisclaimer.text"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { useBonoWallet } from '@/composables/useWallet';
import { useCampaign } from '@/composables/useCampaign';
import { useShare } from '@/composables/share';
import { formatWallet } from '@/composables/formatWallet';
import { showToast } from '@/composables/toast';
import { kSupportedTokens } from '@/composables/Tokens';
import ContributionsPopup from '@/components/ContributionsPopup.vue';
import { mock } from '@/utils/mocks/public'; // Correctly import public mock data

const route = useRoute();
const router = useRouter();
const { connected, publicKey, connect, sendTransaction } = useBonoWallet();
const { currentCampaign, fetchCampaign, contributeToCampaign } = useCampaign();

const amount = ref(0);
const contributionsPopupOpened = ref(false);
const field1 = ref("");
const field2 = ref("");
const amountInput = ref();
const contributionAmount = ref(0);
const contributorName = ref('');
const contributorComment = ref('');

// Ensure mock data is compatible with the Campaign interface
const mockCampaign = {
  id: "mock-id",
  walletAddress: "mock-wallet",
  email: "mock@example.com",
  title: mock.title,
  description: mock.description,
  goalAmount: mock.stats.goal,
  currentAmount: mock.stats.balance,
  token: mock.stats.currency,
  endDate: "2024-12-31",
  status: mock.stats.status,
  stats: mock.stats,
  contribution: mock.contribution,
  shareTo: mock.shareTo,
  legalDisclaimer: mock.legalDisclaimer,
  caseDetails: mock.caseDetails,
  legalUpdate: mock.legalUpdate
};

// Fetch campaign data and use mock as fallback
onMounted(async () => {
  try {
    const caseId = route.params.id as string;
    await fetchCampaign(caseId);
    if (!currentCampaign.value) {
      currentCampaign.value = mockCampaign; // Use mock data as fallback
      showToast('Using mock data as fallback', 'warning');
    }
  } catch (error) {
    console.error('Failed to fetch case data:', error);
    showToast('Failed to load case data', 'error');
  }
});

watch(amountInput, () => {
  if (amountInput.value) {
    amountInput.value.innerText = '0';
  }
}, { once: true });

watch(amount, () => {
  nextTick(() => {
    if (amountInput.value) {
      amountInput.value.style.width = '0';
      amountInput.value.style.width = amountInput.value.scrollWidth + 10 + "px";
    }
  });
});

const applyAmount = () => {
  if (amountInput.value && amountInput.value.value > 9_999_999_999) {
    amountInput.value.value = 9_999_999_999;
  }
};

const connectWallet = async () => {
  try {
    await connect();
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    showToast('Failed to connect wallet', 'error');
  }
};

const makeDonation = async () => {
  if (!connected || !publicKey) {
    showToast('Wallet is not connected', 'error');
    return;
  }

  try {
    await contributeToCampaign(route.params.public_key as string, {
      amount: parseFloat(amountInput.value?.value || '0'),
      contributorAddress: publicKey.toString(),
      name: field1.value,
      comment: field2.value,
    });
    showToast('Donation successful', 'success');
    // Refresh campaign data after donation
    await fetchCampaignData();
  } catch (error) {
    console.error('Donation failed:', error);
    showToast('Donation failed. Please try again.', 'error');
  }
};

const fetchCampaignData = async () => {
  try {
    const campaignId = route.params.public_key as string;
    await fetchCampaign(campaignId);
    if (!currentCampaign.value) {
      router.push({ name: 'error' });
    }
  } catch (error) {
    console.error('Failed to fetch campaign data:', error);
    router.push({ name: 'error' });
  }
};

const selectContributionAmount = (amount: number) => {
  contributionAmount.value = amount;
};

const contribute = async () => {
  if (!connected.value) {
    await connect();
    return;
  }

  if (contributionAmount.value <= 0) {
    showToast('Please select a contribution amount', 'error');
    return;
  }

  try {
    const result = await contributeToCampaign(route.params.public_key as string, {
      campaignId: currentCampaign.value!.id,
      amount: contributionAmount.value,
      contributorAddress: publicKey.value!.toString(),
      name: contributorName.value,
      comment: contributorComment.value
    });

    if (result) {
      showToast('Contribution successful!', 'success');
      // Refresh case data to reflect new contribution
      await fetchCampaignData();
    } else {
      showToast('Failed to process contribution', 'error');
    }
  } catch (error) {
    console.error('Contribution error:', error);
    showToast('An error occurred while processing your contribution', 'error');
  }
};

const share = (actionLink: Function) => {
  const url = window.location.href;
  const title = currentCampaign.value?.title;

  if (typeof actionLink === 'string' && actionLink === 'copy') {
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success');
  } else {
    window.open(actionLink(url, title), '_blank');
  }
};
</script>

<style lang="scss" scoped>
.gradient-block {
  border: 3px solid transparent;
  background: linear-gradient(0deg, #fff, #fff) padding-box,
    linear-gradient(90.96deg, #59B4F8 0.96%, #D917BC 101.76%) border-box;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>
