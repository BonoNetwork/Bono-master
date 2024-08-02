import { ref, type Ref } from 'vue';
import { API } from './API';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  endDate: string;
  status: string;
  // Add other campaign properties as needed
}

export function useCampaign() {
  const campaigns: Ref<Campaign[]> = ref([]);
  const currentCampaign: Ref<Campaign | null> = ref(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  

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
  const getCampaignPrivate = async (campaignId: string) => {
    const response = await fetch(`/api/campaigns/${campaignId}/private`);
    if (!response.ok) {
      throw new Error('Failed to fetch campaign data');
    }
    return await response.json();
  };

  const updateCampaign = async (campaignId: string, updates: any) => {
    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update campaign');
    }
    return await response.json();
  };

  const claimFunds = async (campaignId: string, walletAddress: string) => {
    // This should be replaced with an actual API call to claim funds
    const response = await fetch(`/api/campaigns/${campaignId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    });
    return await response.json();
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
    claimFunds,
    updateCampaign
  };
}