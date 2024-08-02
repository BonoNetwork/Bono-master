import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { RequestValidationError } from '../errors/RequestValidationError';
import { Helpers } from '../helpers/Helpers';

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Additional campaign-specific validation logic
        const enhancedErrors = errors.array().map(error => enhanceError(error, req));
        throw new RequestValidationError(enhancedErrors);
    } 

    next();
};

function enhanceError(error: ValidationError, req: Request): ValidationError {
    let maxDuration: number;
    let endDate: Date;
    let maxAllowedDate: Date;
    let minGoal: number;

    switch (error.param) {
        case 'walletAddress':
            if (!Helpers.isValidSolanaAddress(req.body.walletAddress)) {
                error.msg = 'Invalid Solana wallet address';
            }
            break;
        case 'endDate':
            maxDuration = parseInt(process.env.MAX_CAMPAIGN_DURATION || '90');
            endDate = new Date(req.body.endDate);
            maxAllowedDate = Helpers.getDateWithDaysInc(new Date(), maxDuration);
            if (endDate > maxAllowedDate) {
                error.msg = `Campaign duration cannot exceed ${maxDuration} days`;
            }
            break;
        case 'goalAmount':
            minGoal = parseFloat(process.env.MIN_CAMPAIGN_GOAL || '1');
            if (parseFloat(req.body.goalAmount) < minGoal) {
                error.msg = `Campaign goal must be at least ${minGoal} SOL`;
            }
            break;
        // Add more campaign-specific validations as needed
    }
    return error;
}