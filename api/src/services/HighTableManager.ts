import { HighTable } from "../entities/HighTable";
import { BadRequestError } from "../errors/BadRequestError";
import { PublicKey } from "@solana/web3.js";

export class HighTableManager {
    static async addMember(
        walletAddress: string,
        firmName: string,
        jurisdiction: string[],
        legalExpertise: string[]
    ): Promise<HighTable> {
        // Validate wallet address
        try {
            new PublicKey(walletAddress);
        } catch (error) {
            throw new BadRequestError("Invalid wallet address");
        }

        // Check if wallet is already a member
        const existingMember = await HighTable.findOne({ walletAddress });
        if (existingMember) {
            throw new BadRequestError("Wallet is already a High Table member");
        }

        // Create new High Table member
        const newMember = new HighTable({
            walletAddress,
            firmName,
            jurisdiction,
            legalExpertise,
            joinDate: new Date(),
        });

        await newMember.save();
        return newMember;
    }

    static async removeMember(walletAddress: string): Promise<void> {
        const result = await HighTable.deleteOne({ walletAddress });
        if (result.deletedCount === 0) {
            throw new BadRequestError("Member not found");
        }
    }

    static async getAllMembers(): Promise<HighTable[]> {
        return HighTable.find();
    }

    static async getMember(walletAddress: string): Promise<HighTable | null> {
        return HighTable.findOne({ walletAddress });
    }
    static async updateMember(
        walletAddress: string,
        updates: Partial<HighTable>
    ): Promise<HighTable | null> {
        const member = await HighTable.findOne({ walletAddress });
        if (!member) {
            throw new BadRequestError("Member not found");
        }

        Object.assign(member, updates);
        await member.save();
        return member;
    }

    static async isHighTableMember(walletAddress: string): Promise<boolean> {
        const member = await HighTable.findOne({ walletAddress });
        return !!member;
    }

    static async incrementCasesHandled(walletAddress: string): Promise<HighTable | null> {
        const member = await HighTable.findOneAndUpdate(
            { walletAddress },
            { $inc: { casesHandled: 1 } },
            { new: true }
        );

        if (!member) {
            throw new BadRequestError("Member not found");
        }

        return member;
    }

    static async getMembersByJurisdiction(jurisdiction: string): Promise<HighTable[]> {
        return HighTable.find({ jurisdiction: jurisdiction });
    }

    static async getMembersByLegalExpertise(expertise: string): Promise<HighTable[]> {
        return HighTable.find({ legalExpertise: expertise });
    }
}