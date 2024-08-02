import { Schema, model, Document } from 'mongoose';
import { HighTableMember } from '../models/types';


const HighTableSchema = new Schema<HighTableMember>({
    walletAddress: { type: String, required: true, unique: true },
    firmName: { type: String, required: true },
    jurisdiction: { type: [String], required: true },
    legalExpertise: { type: [String], required: true },
    reputation: { type: Number, default: 0 },
    casesHandled: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now }
}, {
    timestamps: true // This will add createdAt and updatedAt fields
});

HighTableSchema.index({ walletAddress: 1 });
HighTableSchema.index({ jurisdiction: 1 });
HighTableSchema.index({ legalExpertise: 1 });

export const HighTable = model<HighTableMember & Document>('HighTable', HighTableSchema);