import { Campaign } from '../entities/Campaign';
import { CampaignNotFoundError } from '../errors/CampaignNotFoundError';
import { InsufficientFundsError } from '../errors/InsufficientFundsError';
import { BadRequestError } from '../errors/BadRequestError';
import { CampaignModel, CampaignStatus, CampaignCreationParams, CampaignContributionParams, CampaignRedemptionParams } from '../models/types';
import { SolanaManager } from './solana/SolanaManager';
import { HighTableManager } from './HighTableManager';
import { Helpers } from '../helpers/Helpers';

export class CampaignManager {
    static async createCampaign(params: CampaignCreationParams, creatorId: string): Promise<CampaignModel> {
        const { nftAddress, tokenMintAddress } = await SolanaManager.createCampaignNFTAndToken(params);
        
        const slug = Helpers.generateCampaignSlug(params.title);

        const campaign = new Campaign({
            ...params,
            host: creatorId,
            assetAddress: nftAddress,
            tokenMintAddress: tokenMintAddress,
            status: CampaignStatus.ACTIVE,
            currentAmount: 0,
            contributors: []
        });

        await campaign.save();
        return campaign;
    }

    static async getAllCampaigns(): Promise<CampaignModel[]> {
        return Campaign.find();
    }

    static async getCampaignById(id: string): Promise<CampaignModel | null> {
        return Campaign.findById(id);
    }

    static async contributeToCampaign(params: CampaignContributionParams): Promise<CampaignModel> {
        const { campaignId, contributorAddress, amount } = params;
        const campaign = await Campaign.findById(campaignId);
        const share = Helpers.calculateContributionShare(params.amount, campaign.currentAmount + params.amount);
        if (!campaign) {
            throw new CampaignNotFoundError(campaignId);
        }

        if (campaign.status !== CampaignStatus.ACTIVE) {
            throw new BadRequestError('Campaign is not active');
        }

        const userBalance = await SolanaManager.getBalance(contributorAddress);
        if (userBalance < amount) {
            throw new InsufficientFundsError(amount, userBalance);
        }

        await SolanaManager.contributeToCampaign(campaign.walletAddress, contributorAddress, amount);

        campaign.currentAmount += amount;
        campaign.contributors.push({ address: contributorAddress, amount, date: new Date() });

        if (campaign.currentAmount >= campaign.goalAmount) {
            campaign.status = CampaignStatus.FUNDED;
        }

        await campaign.save();
        return campaign;
    }

    static async updateCampaignStatus(campaignId: string, newStatus: CampaignStatus, updaterId: string): Promise<CampaignModel> {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new CampaignNotFoundError(campaignId);
        }

        const isHighTableMember = await HighTableManager.isHighTableMember(updaterId);
        if (!isHighTableMember) {
            throw new NotAuthorizedError('Only High Table members can update campaign status');
        }

        campaign.status = newStatus;
        await campaign.save();
        return campaign;
    }

    static async endCampaign(campaignId: string, enderId: string): Promise<CampaignModel> {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new CampaignNotFoundError(campaignId);
        }

        const isHighTableMember = await HighTableManager.isHighTableMember(enderId);
        const isCreator = campaign.host === enderId;
        if (!isHighTableMember && !isCreator) {
            throw new NotAuthorizedError('Only High Table members or the campaign creator can end the campaign');
        }

        if (campaign.currentAmount >= campaign.goalAmount) {
            campaign.status = CampaignStatus.WON;
        } else {
            campaign.status = CampaignStatus.LOST;
        }

        await campaign.save();
        return campaign;
    }

    static async redeemCampaignTokens(params: CampaignRedemptionParams): Promise<CampaignModel> {
        const { campaignId, redeemerAddress, amount } = params;
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new CampaignNotFoundError(campaignId);
        }

        if (campaign.status !== CampaignStatus.WON) {
            throw new BadRequestError('Campaign is not in a state for token redemption');
        }

        await SolanaManager.redeemCampaignTokens(campaign.tokenMintAddress, redeemerAddress, amount);

        // Update campaign state if necessary
        await campaign.save();
        return campaign;
    }
}