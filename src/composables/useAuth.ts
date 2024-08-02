import { ref } from 'vue';
import { useWallet } from 'solana-wallets-vue';

export function useAuth() {
  const { publicKey } = useWallet();
  const isHighTable = ref(false);

  const checkHighTableStatus = async () => {
    if (!publicKey.value) return false;
    // This should be replaced with an actual API call to check High Table status
    const response = await fetch(`/api/high-table/check/${publicKey.value.toString()}`);
    isHighTable.value = await response.json();
    return isHighTable.value;
  };

  const isHighTableMember = async () => {
    if (isHighTable.value) return true;
    return await checkHighTableStatus();
  };

  const isContributor = async (campaignId: string) => {
    if (!publicKey.value) return false;
    // This should be replaced with an actual API call to check contributor status
    const response = await fetch(`/api/campaigns/${campaignId}/contributors/${publicKey.value.toString()}`);
    return await response.json();
  };

  return {
    isHighTableMember,
    isContributor,
    isHighTable
  };
}