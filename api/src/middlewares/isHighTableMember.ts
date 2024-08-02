import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/NotAuthorizedError';
import { HighTableManager } from '../services/HighTableManager';

// Extend the Express Request type to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

export const isHighTableMember = async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        throw new NotAuthorizedError();
    }

    const isHighTableMember = await HighTableManager.isHighTableMember(req.user.id);
    if (!isHighTableMember) {
        throw new NotAuthorizedError();
    }

    next();
};