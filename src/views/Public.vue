<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-500 to-teal-400 py-12">
    <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="p-8">
        <h1 class="text-3xl font-bold mb-4">{{ mock.title }}</h1>
        <p class="text-gray-600 mb-6">{{ mock.description }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Case Statistics</h2>
            <p><strong>Balance:</strong> {{ mock.stats.balance }} {{ mock.stats.currency }}</p>
            <p><strong>Withdrawn:</strong> {{ mock.stats.withdrawn }} {{ mock.stats.currency }}</p>
            <p><strong>Goal:</strong> {{ mock.stats.goal }} {{ mock.stats.currency }}</p>
            <p><strong>Case Owner:</strong> {{ mock.stats.caseOwner }}</p>
            <p><strong>Legal Firm:</strong> {{ mock.stats.legalFirm }}</p>
            <p><strong>Status:</strong> {{ mock.stats.status }}</p>
            <p><strong>High Table Approval:</strong> {{ mock.stats.highTableApproval }}</p>
          </div>
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Case Details</h2>
            <p><strong>Incident Date:</strong> {{ mock.caseDetails.incidentDate }}</p>
            <p><strong>Jurisdiction:</strong> {{ mock.caseDetails.jurisdiction }}</p>
            <p><strong>Case Type:</strong> {{ mock.caseDetails.caseType }}</p>
            <p><strong>Evidence Summary:</strong> {{ mock.caseDetails.evidenceSummary }}</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Legal Update</h2>
          <div class="bg-blue-100 p-6 rounded-lg">
            <p><strong>Last Update:</strong> {{ mock.legalUpdate.lastUpdate }}</p>
            <p><strong>Status:</strong> {{ mock.legalUpdate.status }}</p>
            <p><strong>Next Steps:</strong> {{ mock.legalUpdate.nextSteps }}</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">{{ mock.contribution.title }}</h2>
          <p class="text-sm text-gray-600 mb-4">{{ mock.contribution.fee }}</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              v-for="option in mock.contribution.options"
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
              :placeholder="mock.contribution.field1Placeholder"
              class="w-full p-2 border rounded-lg"
            />
          </div>
          <div class="mb-4">
            <textarea
              v-model="contributorComment"
              :placeholder="mock.contribution.field2Placeholder"
              class="w-full p-2 border rounded-lg"
              rows="3"
            ></textarea>
          </div>
          <button
            @click="contribute"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {{ mock.contribution.buttonText }}
          </button>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">{{ mock.contribution.contributionsText }}</h2>
          <div class="bg-gray-100 p-4 rounded-lg">
            <!-- Add a list of recent contributions here -->
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Share This Case</h2>
          <div class="flex space-x-4">
            <button
              v-for="btn in mock.shareTo.btns"
              :key="btn.text"
              @click="share(btn.actionLink)"
              class="py-2 px-4 rounded-lg text-white"
              :style="{ backgroundColor: btn.bgColor }"
            >
              {{ btn.text }}
            </button>
          </div>
        </div>

        <div class="text-sm text-gray-600" v-html="mock.legalDisclaimer.text"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { useBonoWallet} from '@/composables/useWallet';
import { useCampaign } from '@/composables/useCampaign';
import { useFormatter } from '@/composables/currencyFormatter';
import { useShare } from '@/composables/share';
import { formatWallet } from '@/composables/formatWallet';
import { showToast } from '@/composables/toast';
import { kSupportedTokens } from '@/composables/Tokens';
import ContributionsPopup from '@/components/ContributionsPopup.vue';

const route = useRoute();
const router = useRouter();
const { connected, publicKey, connect, sendTransaction } = useBonoWallet();
const { getCampaign, contributeToCampaign } = useCampaign();

const amount = ref(0);
const contributionsPopupOpened = ref(false);
const field1 = ref("");
const field2 = ref("");
const amountInput = ref();
const caseData = ref<any>(null);
const contributionAmount = ref(0);
const contributorName = ref('');
const contributorComment = ref('');
const dynamicData = ref({
  title: null,
  description: null,
  host: null,
  token: null,
  tokenAddress: null,
  goal: null,
  balance: null,
  withdrawn: null,
  contributors: [],
  transactions: [],
  uniqueWalletsCount: null,
  transactionsCount: null,
});

watch(amountInput, () => {
  amountInput.value.innerText = '0';
}, { once: true })

watch(amount, () => {
  nextTick(() => {
    amountInput.value.style.width = 0;
    amountInput.value.style.width = amountInput.value.scrollWidth + 10 + "px";
  })
})

const applyAmount = () => {
  if (amountInput.value.value > 9_999_999_999) {
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
      amount: parseFloat(amountInput.value.value),
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
    const campaign = await getCampaign(route.params.public_key as string);
    if (!campaign) {
      router.push({ name: 'error' });
      return;
    }

    dynamicData.value = {
      title: campaign.title,
      description: campaign.description,
      host: formatWallet(campaign.host),
      token: campaign.token,
      tokenAddress: campaign.tokenAddress,
      goal: campaign.goalAmount.toString(),
      balance: campaign.currentAmount,
      withdrawn: campaign.withdrawn,
      contributors: campaign.contributors,
      transactions: campaign.transactions,
      uniqueWalletsCount: campaign.uniqueContributorsCount,
      transactionsCount: campaign.transactionsCount,
    };
  } catch (error) {
    console.error('Failed to fetch campaign data:', error);
    router.push({ name: 'error' });
  }
};

onMounted(async () => {
  try {
    const caseId = route.params.id as string;
    const fetchedCaseData = await getCampaign(caseId);
    if (fetchedCaseData) {
      caseData.value = fetchedCaseData;
    } else {
      // If no data is fetched, use mock data as fallback
      caseData.value = mock;
      showToast('Using mock data as fallback', 'warning');
    }
  } catch (error) {
    console.error('Failed to fetch case data:', error);
    showToast('Failed to load case data', 'error');
    // Use mock data as fallback
    caseData.value = mock;
  }
});

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
    const result = await contributeToCampaign({
      campaignId: caseData.value.id,
      amount: contributionAmount.value,
      contributorAddress: publicKey.value!.toString(),
      name: contributorName.value,
      comment: contributorComment.value
    });

    if (result) {
      showToast('Contribution successful!', 'success');
      // Refresh case data to reflect new contribution
      caseData.value = await getCampaign(caseData.value.id);
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
  const title = caseData.value.title;

  if (actionLink === 'copy') {
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