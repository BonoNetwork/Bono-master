export interface TransactionStatus {
    status: Status;
    signature?: string;
    blockhash?: string;
    triesCount?: number;
    createdAt?: Date;
}

export enum Status {
    CREATED = 'CREATED',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
}

export interface TransactionStatusResponse {
    id: string;
    signature?: string;
    status?: Status;
}

export enum Environment {
    PRODUCTION = 'PRODUCTION',
    DEVELOPMENT = 'DEVELOPMENT'
}

export interface WalletModel {
    publicKey: string; 
    privateKey: number[];
}

export enum AssetType {
    pNFT = 'pNFT',
    NFT = 'NFT',
    cNFT = 'cNFT',
    SOL = 'SOL',
    SPL = 'SPL',
    UNKNOWN = 'UNKNOWN'
}

export interface Asset {
    id: string;
    type: AssetType;
    title: string;
    image?: string;
    isLocked?: boolean;
    collection?: {
        id: string,
        title?: string,
    };
}

export interface Token {
    mintAddress: string;
    decimals: number;
    name: string;
}

// New types for campaign management

export enum CampaignStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    FUNDED = 'FUNDED',
    IN_PROGRESS = 'IN_PROGRESS',
    WON = 'WON',
    LOST = 'LOST',
    SETTLED = 'SETTLED'
}

export interface CampaignModel {
    id: string;
    title: string;
    description: string;
    host: string; // wallet address of the campaign creator
    walletAddress: string; // campaign's wallet address
    goalAmount: number;
    currentAmount: number;
    endDate: Date;
    image?: string;
    assetAddress: string; // NFT address representing the campaign
    tokenMintAddress: string; // address of the campaign's speculation token
    jurisdiction: string;
    legalExpertise: string[];
    status: CampaignStatus;
    contributors: Contributor[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Contributor {
    address: string;
    amount: number;
    date: Date;
}

export interface HighTableMember {
    walletAddress: string;
    firmName: string;
    jurisdiction: string[];
    legalExpertise: string[];
    reputation: number;
    casesHandled: number;
    joinDate: Date;
}

export interface CampaignCreationParams {
    title: string;
    description: string;
    goalAmount: number;
    endDate: Date;
    image?: string;
    jurisdiction: string;
    legalExpertise: string[];
}

export interface CampaignContributionParams {
    campaignId: string;
    contributorAddress: string;
    amount: number;
}

export interface CampaignRedemptionParams {
    campaignId: string;
    redeemerAddress: string;
    amount: number;
}