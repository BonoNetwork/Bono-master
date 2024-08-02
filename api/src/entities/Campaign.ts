import { Schema, model, Document } from 'mongoose';
import { CampaignModel, CampaignStatus, Contributor } from '../models/types';



const ContributorSchema = new Schema<Contributor>({
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const CampaignSchema = new Schema<CampaignModel>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    host: { type: String, required: true },
    walletAddress: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    endDate: { type: Date, required: true },
    image: { type: String },
    assetAddress: { type: String, required: true },
    tokenMintAddress: { type: String, required: true },
    jurisdiction: { type: String, required: true },
    legalExpertise: { type: [String], required: true },
    status: { 
        type: String, 
        enum: Object.values(CampaignStatus), 
        default: CampaignStatus.DRAFT 
    },
    contributors: [ContributorSchema],
}, {
    timestamps: true // This will add createdAt and updatedAt fields
});

CampaignSchema.index({ host: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ jurisdiction: 1 });
CampaignSchema.index({ legalExpertise: 1 });

// This pre-save hook is not necessary when using timestamps: true
// CampaignSchema.pre('save', function(next) {
//     this.updatedAt = new Date();
//     next();
// });

export const Campaign = model<CampaignModel & Document>('Campaign', CampaignSchema);