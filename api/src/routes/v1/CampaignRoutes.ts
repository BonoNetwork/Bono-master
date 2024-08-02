import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../../middlewares/ValidateRequest';
import { CampaignManager } from '../../services/CampaignManager';
import { CampaignNotFoundError } from '../../errors/CampaignNotFoundError';
import { InsufficientFundsError } from '../../errors/InsufficientFundsError';
import { isHighTableMember } from '../../middlewares/isHighTableMember';
import { Helpers } from '../helpers/Helpers';

const router = express.Router();

router.post(
    '/api/v1/campaigns',
    isHighTableMember,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('walletAddress').notEmpty().withMessage('Wallet address is required'),
        body('goalAmount').isNumeric().withMessage('Goal amount must be a number'),
        body('endDate').isISO8601().toDate().withMessage('End date must be a valid date'),
        // Add other necessary validations
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const campaign = await CampaignManager.createCampaign(req.body);
        res.status(201).json(campaign);
    }
);

router.get('/api/v1/campaigns', async (req: Request, res: Response) => {
    const campaigns = await CampaignManager.getAllCampaigns();
    res.status(200).json(campaigns);
});

router.get('/api/v1/campaigns/:id', async (req: Request, res: Response) => {
    const campaign = await CampaignManager.getCampaignById(req.params.id);
    if (campaign) {
        const timeLeft = Helpers.calculateTimeLeft(campaign.endDate);
        const progress = Helpers.calculateFundingProgress(campaign.currentAmount, campaign.goalAmount);
        res.status(200).json({
            ...campaign.toJSON(),
            timeLeft,
            progress,
            formattedGoal: Helpers.formatCurrency(campaign.goalAmount, 'SOL')
        });
    } else {
        // Handle not found case
    }
});

router.post(
    '/api/v1/campaigns/:id/contribute',
    [
        body('amount').isNumeric().withMessage('Contribution amount must be a number'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const contribution = await CampaignManager.contributeToCampaign(req.params.id, req.body.amount, req.user.id);
            res.status(200).json(contribution);
        } catch (error) {
            if (error instanceof InsufficientFundsError) {
                res.status(400).json({ message: error.message, required: error.required, available: error.available });
            } else {
                throw error;
            }
        }
    }
);

export { router as campaignRouter };