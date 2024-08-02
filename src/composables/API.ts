const API_BASE_URL = 'https://app.bono.network/api';

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