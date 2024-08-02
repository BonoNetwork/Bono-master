export const API_BASE_URL = 'https://app.bono.network/api';
interface CampaignData {
  walletAddress: string;
  email: string;
  title: string;
  description: string;
  goalAmount: number;
  token: string;
  endDate: string;
  image?: string;
}

interface ContributionData {
  amount: number;
  contributorAddress: string;
  email: string;
  name?: string;
}
interface HighTableMember {
  walletAddress: string;
  firmName: string;
  jurisdiction: string[];
  legalExpertise: string[];
  reputation: number;
  casesHandled: number;
  joinDate: Date;
}
export const API = {
  async createCampaign(campaignData: CampaignData) {
    return fetch(`${API_BASE_URL}/v1/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(campaignData)
    });
  },

  async getCampaigns() {
    return fetch(`${API_BASE_URL}/v1/campaigns`);
  },

  async getCampaign(id: string) {
    return fetch(`${API_BASE_URL}/v1/campaigns/${id}`);
  },

  async contributeToCampaign(campaignId: string, contributionData: ContributionData) {
    return fetch(`${API_BASE_URL}/v1/campaigns/${campaignId}/contribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contributionData)
    });
  },
  async getHighTableMembers() {
    return fetch(`${API_BASE_URL}/v1/high-table/members`);
  },

  async addHighTableMember(memberData: Omit<HighTableMember, 'reputation' | 'casesHandled' | 'joinDate'>) {
    return fetch(`${API_BASE_URL}/v1/high-table/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(memberData)
    });
  },

  async updateHighTableMember(walletAddress: string, updateData: Partial<HighTableMember>) {
    return fetch(`${API_BASE_URL}/v1/high-table/members/${walletAddress}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateData)
    });
  },

  async removeHighTableMember(walletAddress: string) {
    return fetch(`${API_BASE_URL}/v1/high-table/members/${walletAddress}`, {
      method: "DELETE"
    });
  },
  async updateCampaignStatus(campaignId: string, status: string, updaterAddress: string) {
    return fetch(`${API_BASE_URL}/v1/campaigns/${campaignId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status, updaterAddress })
    });
  }
};