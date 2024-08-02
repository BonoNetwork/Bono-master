import * as mongoose from 'mongoose';

export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;

export interface ICampaign extends mongoose.Document {
    title: string;
    description: string;
    host: string;
    goalAmount: number;
    currentAmount: number;
    image: string;
    startDate: Date;
    endDate: Date;
    walletAddress: string;
    status: 'active' | 'completed' | 'cancelled';
    contributors: Array<{
        address: string;
        amount: number;
        date: Date;
    }>;
    updatedAt?: Date;
    createdAt?: Date;
}

export const CampaignSchema = new mongoose.Schema<ICampaign>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    host: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    image: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    walletAddress: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    contributors: [{
        address: String,
        amount: Number,
        date: { type: Date, default: Date.now }
    }],
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

CampaignSchema.index({ host: 1 });
CampaignSchema.index({ status: 1 });

CampaignSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    return next();
});

CampaignSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
};

export const Campaign = mongoose.model<ICampaign>('campaigns', CampaignSchema);