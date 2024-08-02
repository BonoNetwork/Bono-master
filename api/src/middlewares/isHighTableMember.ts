import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/NotAuthorizedError';
import { HighTableManager } from '../services/HighTableManager';

export const isHighTableMember = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        throw new NotAuthorizedError('User not authenticated');
    }

    const isHighTableMember = await HighTableManager.isHighTableMember(req.user.id);
    if (!isHighTableMember) {
        throw new NotAuthorizedError('User is not a High Table member');
    }

    next();
};