import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/ValidateRequest";
import { HighTableManager } from "../services/HighTableManager";
import { isAdmin } from "../middlewares/isAdmin"; // You'll need to create this middleware

const router = express.Router();

router.post(
    '/api/v1/high-table/add',
    isAdmin, // Ensure only admins can access this route
    [
        body('walletAddress').notEmpty().withMessage('Wallet Address must be valid'),
        body('firmName').notEmpty().withMessage('Firm name must be provided'),
        body('jurisdiction').isArray().withMessage('Jurisdiction must be an array'),
        body('legalExpertise').isArray().withMessage('Legal expertise must be an array'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { walletAddress, firmName, jurisdiction, legalExpertise } = req.body;

        const newMember = await HighTableManager.addMember(walletAddress, firmName, jurisdiction, legalExpertise);

        res.status(201).json(newMember);
    }
);

router.delete(
    '/api/v1/high-table/remove/:walletAddress',
    isAdmin,
    async (req: Request, res: Response) => {
        const { walletAddress } = req.params;

        await HighTableManager.removeMember(walletAddress);

        res.status(200).json({ message: "Member removed successfully" });
    }
);

router.get(
    '/api/v1/high-table/members',
    isAdmin,
    async (req: Request, res: Response) => {
        const members = await HighTableManager.getAllMembers();

        res.status(200).json(members);
    }
);

export { router as highTableRouter };