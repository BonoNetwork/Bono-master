import { ref, type Ref } from 'vue';
import { API } from './API';

// Define the Campaign interface
interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  endDate: string;
  status: string;
  stats: {
    currency: string;
    balance: number;
    withdrawn: number;
    goal: number;
    caseOwner: string;
    legalFirm: string;
    status: string;
    highTableApproval: string;
  };
  contribution: {
    title: string;
    fee: string;
    options: Array<{
      id: string;
      title: string;
      description: string;
      amount: number;
    }>;
    field1Placeholder: string;
    field2Placeholder: string;
    buttonText: string;
    contributionsText: string;
  };
  caseDetails: {
    incidentDate: string;
    jurisdiction: string;
    caseType: string;
    evidenceSummary: string;
  };
  legalUpdate: {
    lastUpdate: string;
    status: string;
    nextSteps: string;
  };
  shareTo: {
    text: string;
    btns: Array<{
      text: string;
      actionLink: Function;
      bgColor: string;
    }>;
  };
  legalDisclaimer: {
    text: string;
    buttons: Array<{
      text: string;
      action: Function;
    }>;
  };
}



export function useCampaign() {
  // Reactive references for campaigns and current campaign
  const campaigns: Ref<Campaign[]> = ref([]);
  const currentCampaign: Ref<Campaign | null> = ref(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.getCampaigns();
      const data = await response.json();
      campaigns.value = data;
    } catch (err) {
      error.value = 'Failed to fetch campaigns';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single campaign by ID
  const fetchCampaign = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.getCampaign(id);
      const data = await response.json();
      currentCampaign.value = data;
    } catch (err) {
      error.value = 'Failed to fetch campaign';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Create a new campaign
  const createCampaign = async (campaignData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.createCampaign(campaignData);
      const data = await response.json();
      campaigns.value.push(data);
      return data;
    } catch (err) {
      error.value = 'Failed to create campaign';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Contribute to a campaign
  const contributeToCampaign = async (campaignId: string, contributionData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.contributeToCampaign(campaignId, contributionData);
      const data = await response.json();
      // Update the current campaign if it's the one we contributed to
      if (currentCampaign.value && currentCampaign.value.id === campaignId) {
        currentCampaign.value = data;
      }
      return data;
    } catch (err) {
      error.value = 'Failed to contribute to campaign';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get private campaign data
  const getCampaignPrivate = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/private`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign data');
      }
      return await response.json();
    } catch (err) {
      console.error('Failed to fetch private campaign data:', err);
      throw err;
    }
  };

  // Update a campaign
  const updateCampaign = async (campaignId: string, updates: any) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }
      return await response.json();
    } catch (err) {
      console.error('Failed to update campaign:', err);
      throw err;
    }
  };

  // Claim funds from a campaign
  const claimFunds = async (campaignId: string, walletAddress: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      return await response.json();
    } catch (err) {
      console.error('Failed to claim funds:', err);
      throw err;
    }
  };

  return {
    campaigns,
    currentCampaign,
    loading,
    error,
    fetchCampaigns,
    fetchCampaign,
    createCampaign,
    contributeToCampaign,
    getCampaignPrivate,
    updateCampaign,
    claimFunds,
  };
}
