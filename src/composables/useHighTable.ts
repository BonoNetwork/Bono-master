import { ref, Ref } from 'vue';
import { API } from './API';

interface HighTableMember {
  id: string;
  walletAddress: string;
  name: string;
  // Add other High Table member properties as needed
}

export function useHighTable() {
  const members: Ref<HighTableMember[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMembers = async () => {
    loading.value = true;
    error.value = null;
    try {
      // Assume there's an API endpoint for fetching High Table members
      const response = await fetch(`${API.API_BASE_URL}/v1/high-table/members`);
      const data = await response.json();
      members.value = data;
    } catch (err) {
      error.value = 'Failed to fetch High Table members';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string, updaterAddress: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.updateCampaignStatus(campaignId, status, updaterAddress);
      const data = await response.json();
      return data;
    } catch (err) {
      error.value = 'Failed to update campaign status';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    updateCampaignStatus
  };
}