import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/CustomError';
import { ErrorResponse } from '../responses/ErrorResponse';
import { CampaignNotFoundError } from '../errors/CampaignNotFoundError';
import { InsufficientFundsError } from '../errors/InsufficientFundsError';

export const errorHandler = (
    err: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    let response: ErrorResponse;

    if (err instanceof CustomError) {
        response = new ErrorResponse(err.serializeErrors());
        return res.status(err.statusCode).send(response);
    }

    if (err instanceof CampaignNotFoundError) {
        response = new ErrorResponse([{ code: 404, message: err.message }]);
        return res.status(err.statusCode).send(response);
    }

    if (err instanceof InsufficientFundsError) {
        response = new ErrorResponse([{ 
            code: 400, 
            message: err.message, 
            required: err.required, 
            available: err.available 
        }]);
        return res.status(err.statusCode).send(response);
    }

    if (err.name === 'UnauthorizedError' || err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError'){
        if (err.message === 'jwt expired'){
            response = new ErrorResponse([{ code:112, message: 'Access token expired' }]);
        }
        else{
            response = new ErrorResponse([{ code:111, message: 'Unauthorized' }]);
        }
        return res.status(401).send(response);
    }

    response = new ErrorResponse([{ message: err.message }]);
    return res.status(500).send(response);
};