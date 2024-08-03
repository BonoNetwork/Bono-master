import express, { Request, Response } from "express";
import { validateRequest } from "../../middlewares/ValidateRequest";
import { body } from "express-validator";
import { TipLink } from "@tiplink/api";
import { BadRequestError } from "../../errors/BadRequestError";
import { MetaplexManager } from "../../services/solana/MetaplexManager";
import { getConnection } from "../../lib/solana";
import { SolanaManager } from "../../services/solana/SolanaManager";
import { Campaign } from "../../entities/Campaign";
import { HighTable } from "../../entities/HighTable";
import { PublicKey } from "@solana/web3.js";
import { CampaignStatus } from "../../models/types";


const router = express.Router();

// Check if a wallet is part of the High Table
async function isHighTableMember(walletAddress: string): Promise<boolean> {
    const member = await HighTable.findOne({ walletAddress });
    return !!member;
}

router.post(
    '/api/v1/campaigns/create',
    [
        body('walletAddress').notEmpty().withMessage('Wallet Address must be valid'),
        body('title').notEmpty().withMessage('Title must be valid'),
        body('description').notEmpty().withMessage('Description must be valid'),
        body('goalAmount').isNumeric().withMessage('Goal amount must be a number'),
        body('endDate').isISO8601().toDate().withMessage('End date must be a valid date'),
        body('image').optional().isURL().withMessage('Image must be a valid URL'),
        body('jurisdiction').notEmpty().withMessage('Jurisdiction must be provided'),
        body('legalExpertise').isArray().withMessage('Legal expertise must be an array'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { walletAddress, title, description, goalAmount, endDate, image, jurisdiction, legalExpertise } = req.body;

        // Check if wallet is part of the High Table
        if (!(await isHighTableMember(walletAddress))) {
            throw new BadRequestError('Wallet not authorized to create campaigns. Must be a High Table member.');
        }

        const web3Conn = getConnection();
        const creator = await HighTable.findOne({ walletAddress });

        if (!creator) {
            throw new BadRequestError('Creator not found in High Table');
        }

        // Create campaign object
        const campaign = new Campaign({
            title,
            description,
            host: walletAddress,
            goalAmount,
            endDate,
            image,
            jurisdiction,
            legalExpertise,
            status: 'active',
        });
        
        
        // Create NFT for the campaign
        const txData = await MetaplexManager.createCampaignNftTransaction(web3Conn, campaign, creator);

        if (!txData?.tx) {
            throw new BadRequestError('Failed to create a campaign NFT. Try again.');
        }

        // Update campaign with NFT data
        campaign.assetAddress = txData.assetAddress;
        campaign.walletAddress = txData.tx.feePayer!.toBase58();

        // Create token for the campaign
        const tokenMint = await SolanaManager.createToken(
            web3Conn,
            SolanaManager.getMainWalletKeypair(),
            'CASE',
            'CASE',
            9,
            campaign.walletAddress
        );
        campaign.tokenMintAddress = tokenMint.toBase58();

        await campaign.save();

        const encodedTransaction = txData.tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });
        const encodedTransactionString = JSON.stringify(encodedTransaction.toJSON());

        res.status(201).json({
            campaign,
            nftTransaction: encodedTransactionString,
            tokenMintAddress: tokenMint.toBase58(),
        });
    }
);

// Contribute to a campaign
router.post(
    '/api/v1/campaigns/:id/contribute',
    [
        body('amount').isNumeric().withMessage('Contribution amount must be a number'),
        body('contributorAddress').notEmpty().withMessage('Contributor address must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { amount, contributorAddress } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            throw new BadRequestError('Campaign not found');
        }

        const web3Conn = getConnection();
        const contributionTx = await SolanaManager.contributeToCase(
            web3Conn,
            new PublicKey(contributorAddress),
            new PublicKey(campaign.walletAddress),
            new PublicKey(campaign.tokenMintAddress),
            amount
        );

        campaign.currentAmount += amount;
        campaign.contributors.push({ address: contributorAddress, amount, date: new Date() });

        if (campaign.currentAmount >= campaign.goalAmount) {
            campaign.status = CampaignStatus.FUNDED;
        }

        await campaign.save();

        res.status(200).json({
            campaign,
            contributionTransaction: contributionTx,
        });
    }
);

// Redeem tokens (if case wins)
router.post(
    '/api/v1/campaigns/:id/redeem',
    [
        body('redeemAmount').isNumeric().withMessage('Redeem amount must be a number'),
        body('redeemerAddress').notEmpty().withMessage('Redeemer address must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { redeemAmount, redeemerAddress } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            throw new BadRequestError('Campaign not found');
        }

        if (campaign.status !== CampaignStatus.WON) {
            throw new BadRequestError('Campaign has not been won yet');
        }

        const web3Conn = getConnection();
        const redeemTx = await SolanaManager.redeemCaseTokens(
            web3Conn,
            new PublicKey(redeemerAddress),
            new PublicKey(campaign.walletAddress),
            new PublicKey(campaign.tokenMintAddress),
            redeemAmount
        );

        res.status(200).json({
            success: true,
            redeemTransaction: redeemTx,
        });
    }
);

// Update campaign status (only by High Table members)
router.put(
    '/api/v1/campaigns/:id/status',
    [
        body('status').isIn(['active', 'funded', 'in_progress', 'won', 'lost', 'settled']).withMessage('Invalid status'),
        body('updaterAddress').notEmpty().withMessage('Updater address must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { status, updaterAddress } = req.body;
        
        if (!(await isHighTableMember(updaterAddress))) {
            throw new BadRequestError('Not authorized to update campaign status');
        }

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!campaign) {
            throw new BadRequestError('Campaign not found');
        }

        res.status(200).json(campaign);
    }
);

// Get all campaigns
router.get('/api/v1/campaigns', async (req: Request, res: Response) => {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
});

// Get a specific campaign
router.get('/api/v1/campaigns/:id', async (req: Request, res: Response) => {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
        throw new BadRequestError('Campaign not found');
    }
    res.status(200).json(campaign);
});

export { router as campaignRouter };