import { ref, type Ref } from 'vue';
import { API } from './API';

interface HighTableMember {
  walletAddress: string;
  firmName: string;
  jurisdiction: string[];
  legalExpertise: string[];
  reputation: number;
  casesHandled: number;
  joinDate: Date;
}

export function useHighTable() {
  const members: Ref<HighTableMember[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMembers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.getHighTableMembers();
      const data = await response.json();
      members.value = data;
    } catch (err) {
      error.value = 'Failed to fetch High Table members';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addMember = async (memberData: Omit<HighTableMember, 'reputation' | 'casesHandled' | 'joinDate'>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.addHighTableMember(memberData);
      const data = await response.json();
      members.value.push(data);
      return data;
    } catch (err) {
      error.value = 'Failed to add High Table member';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateMember = async (walletAddress: string, updateData: Partial<HighTableMember>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await API.updateHighTableMember(walletAddress, updateData);
      const data = await response.json();
      const index = members.value.findIndex(member => member.walletAddress === walletAddress);
      if (index !== -1) {
        members.value[index] = { ...members.value[index], ...data };
      }
      return data;
    } catch (err) {
      error.value = 'Failed to update High Table member';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeMember = async (walletAddress: string) => {
    loading.value = true;
    error.value = null;
    try {
      await API.removeHighTableMember(walletAddress);
      members.value = members.value.filter(member => member.walletAddress !== walletAddress);
    } catch (err) {
      error.value = 'Failed to remove High Table member';
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
    addMember,
    updateMember,
    removeMember
  };
}