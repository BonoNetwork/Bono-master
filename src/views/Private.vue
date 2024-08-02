<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-500 to-teal-400 py-12">
    <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="p-8">
        <h1 class="text-3xl font-bold mb-4">{{ caseData.title }}</h1>
        <p class="text-gray-600 mb-6">{{ caseData.description }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Case Statistics</h2>
            <p><strong>Currency:</strong> {{ caseData.stats.currency }}</p>
            <p><strong>Balance:</strong> {{ caseData.stats.balance }}</p>
            <p><strong>Withdrawn:</strong> {{ caseData.stats.withdrawn }}</p>
            <p><strong>Goal:</strong> {{ caseData.stats.goal }}</p>
            <p><strong>Case Owner:</strong> {{ caseData.stats.caseOwner }}</p>
            <p><strong>Contributors:</strong> {{ caseData.stats.contributors }}</p>
            <p><strong>Transactions:</strong> {{ caseData.stats.transactions }}</p>
            <p><strong>Legal Firm:</strong> {{ caseData.stats.legalFirm }}</p>
            <p><strong>Status:</strong> {{ caseData.stats.status }}</p>
          </div>
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Funds Management</h2>
            <p><strong>{{ caseData.funds.balanceTitle }}:</strong> {{ caseData.funds.balance }}</p>
            <p><strong>Distribution Rules:</strong> {{ caseData.funds.distributionRules }}</p>
            <button
  class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
  @click="() => requestFundDistribution(caseData.id)"
>
  {{ caseData.funds.claimButtonText }}
</button>
            <p class="mt-4 text-sm text-red-500">{{ caseData.funds.bottomWarningText }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">High Table Information</h2>
            <p><strong>Approval Status:</strong> {{ caseData.highTable.approvalStatus }}</p>
            <p><strong>Assigned Member:</strong> {{ caseData.highTable.assignedMember }}</p>
            <p><strong>Notes:</strong> {{ caseData.highTable.notes }}</p>
          </div>
          <div class="bg-gray-100 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Legal Firm Information</h2>
            <p><strong>Name:</strong> {{ caseData.legalFirm.name }}</p>
            <p><strong>Contact:</strong> {{ caseData.legalFirm.contact }}</p>
            <p><strong>Case Progress:</strong> {{ caseData.legalFirm.caseProgress }}</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Share Case Details</h2>
          <div class="flex space-x-4">
            <button
              v-for="btn in caseData.shareTo.btns"
              :key="btn.text"
              @click="share(btn.actionLink)"
              class="py-2 px-4 rounded-lg text-white"
              :style="{ backgroundColor: btn.bgColor }"
            >
              {{ btn.text }}
            </button>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">{{ caseData.funds.contributionsText }}</h2>
          <div class="bg-gray-100 p-4 rounded-lg">
            <!-- Add a list of contributions here -->
          </div>
        </div>

        <div class="text-sm text-gray-600" v-html="caseData.legalDisclaimer.text"></div>
        <div class="mt-4 flex space-x-4">
          <button
            v-for="btn in caseData.legalDisclaimer.buttons"
            :key="btn.text"
            @click="btn.action(router)"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {{ btn.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatCurrency } from '@/composables/currencyFormatter';
import { useShare } from '@/composables/share';
import { mock } from '@/utils/mocks/private';
import { useRoute, useRouter } from "vue-router";
import { showToast } from '@/composables/toast'
import { useCampaign } from '@/composables/useCampaign';
import { useAuth } from '@/composables/useAuth';
import { useBonoWallet } from '@/composables/useWallet';
import { SolanaManager } from '@/managers/SolanaManager';
import { Connection, PublicKey } from '@solana/web3.js';

// Define interfaces
interface DynamicData {
  title: string | null;
  description: string | null;
  host: string | null;
  token: string | null;
  tokenAddress: string | null;
  goal: number | null;
  balance: number | null;
  withdrawn: number | null;
  contributors: never[];
  uniqueWalletsCount: number | null;
  transactionsCount: number | null;
  walletAddress: string | null;
}

interface CaseData {
  id: string;
  title: string;
  image1: string;
  image2: string;
  description: string;
  shareTo: {
    text: string;
    btns: Array<{ text: string; actionLink: Function; bgColor: string }>;
  };
  stats: {
    currency: string;
    balance: number;
    status: string;
    // ... other stats properties
  };
  funds: {
    // ... funds properties
  };
  highTable: {
    // ... highTable properties
  };
  legalFirm: {
    // ... legalFirm properties
  };
  legalDisclaimer: {
    // ... legalDisclaimer properties
  };
}

const router = useRouter();
const route = useRoute();
const { publicKey, connected, connect, sendTransaction } = useBonoWallet();
const { getCampaignPrivate, updateCampaign } = useCampaign();
const { isHighTable } = useAuth();

const caseData = ref<CaseData>(mock);
const dynamicData = ref<DynamicData>({
  title: null,
  description: null,
  host: null,
  token: null,
  tokenAddress: null,
  goal: null,
  balance: null,
  withdrawn: null,
  contributors: [],
  uniqueWalletsCount: null,
  transactionsCount: null,
  walletAddress: null,
});

const claim = async () => {
  if (!publicKey.value) {
    showToast('Please connect your wallet', 'error');
    return;
  }

  try {
    const connection = new Connection(process.env.VUE_APP_SOLANA_RPC_URL as string);
    const transaction = await SolanaManager.createTransaction(
      new PublicKey(dynamicData.value.walletAddress ?? ''),
      publicKey.value.toString(),
      dynamicData.value.balance ?? 0
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');

    showToast('Funds claimed successfully', 'success');
    await fetchCampaignData();
  } catch (error) {
    console.error('Failed to claim funds:', error);
    showToast('Failed to claim funds. Please try again.', 'error');
  }
};

const requestFundDistribution = async () => {
  if (!connected.value) {
    await connect();
    return;
  }

  try {
    const result = await requestFundDistribution(caseData.value.id, publicKey.value!.toString());
    if (result !== undefined) {
      showToast('Fund distribution request submitted successfully', 'success');
      // Refresh case data to reflect the new request
      caseData.value = await getCampaignPrivate(caseData.value.id);
    } else {
      showToast('Failed to submit fund distribution request', 'error');
    }
  } catch (error) {
    console.error('Fund distribution request error:', error);
    showToast('An error occurred while processing your request', 'error');
  }
};
const fetchCampaignData = async () => {
  try {
    const campaign = await getCampaignPrivate(route.params.id as string);
    if (!campaign) {
      router.push({ name: 'error' });
      return;
    }

    dynamicData.value = {
      title: campaign.title,
      description: campaign.description,
      host: campaign.host,
      token: campaign.token,
      tokenAddress: campaign.tokenAddress,
      goal: campaign.goalAmount,
      balance: campaign.currentAmount,
      withdrawn: campaign.withdrawn,
      contributors: campaign.contributors,
      uniqueWalletsCount: campaign.uniqueContributorsCount,
      transactionsCount: campaign.transactionsCount,
    };

    publicKeyToShare.value = campaign.walletAddress;
  } catch (error) {
    console.error('Failed to fetch campaign data:', error);
    router.push({ name: 'error' });
  }
};
// High Table specific functions
const updateCampaignStatus = async () => {
  if (!isHighTable.value) {
    showToast('Only High Table members can update campaign status', 'error');
    return;
  }

  try {
    const newStatus = prompt('Enter new status (active, funded, completed, cancelled):');
    if (!newStatus) return;

    const updatedCampaign = await updateCampaign(route.params.id as string, { status: newStatus });
    dynamicData.value = updatedCampaign;
    showToast('Campaign status updated', 'success');
  } catch (error) {
    console.error('Failed to update campaign status:', error);
    showToast('Failed to update campaign status', 'error');
  }
};
const editCampaignDetails = async () => {
  if (!isHighTable.value) {
    showToast('Only High Table members can edit campaign details', 'error');
    return;
  }

  try {
    const newTitle = prompt('Enter new title:', dynamicData.value.title ?? '');
    const newDescription = prompt('Enter new description:', dynamicData.value.description ?? '') ?? '';
    const newGoalAmount = prompt('Enter new goal amount:', (dynamicData.value.goal ?? 0).toString()) ?? '';
    if (!newTitle && !newDescription && !newGoalAmount) return;

    const updates: any = {};
    if (newTitle) updates.title = newTitle;
    if (newDescription) updates.description = newDescription;
    if (newGoalAmount) updates.goalAmount = parseFloat(newGoalAmount);

    const updatedCampaign = await updateCampaign(route.params.id as string, updates);
    dynamicData.value = updatedCampaign;
    showToast('Campaign details updated', 'success');
  } catch (error) {
    console.error('Failed to edit campaign details:', error);
    showToast('Failed to edit campaign details', 'error');
  }
};

onMounted(async () => {
  try {
    const caseId = route.params.id as string;
    const fetchedCaseData = await getCampaignPrivate(caseId);
    if (fetchedCaseData) {
      caseData.value = fetchedCaseData;
    } else {
      showToast('Using mock data as fallback', 'warning');
    }
  } catch (error) {
    console.error('Failed to fetch case data:', error);
    showToast('Failed to load case data', 'error');
  }
});

const share = (actionLink: Function | string) => {
  const url = window.location.href;
  const title = caseData.value.title;

  if (typeof actionLink === 'string' && actionLink === 'copy') {
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success');
  } else if (typeof actionLink === 'function') {
    window.open(actionLink(url, title), '_blank');
  }
};

</script>
<template>
  <!-- ... rest of your template ... -->
  <button
    class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
    @click="() => requestFundDistribution(caseData.id)"
  >
    {{ caseData.funds.claimButtonText }}
  </button>
  <!-- ... rest of your template ... -->
</template>

<style lang="scss" scoped>
.gradient-block {
  border: 3px solid transparent;
  background: linear-gradient(0deg, #fff, #fff) padding-box,
    linear-gradient(90.96deg, #59B4F8 0.96%, #D917BC 101.76%) border-box;
}
</style>

