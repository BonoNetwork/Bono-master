import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../errors/NotAuthorizedError";

// This is a placeholder implementation. You should replace this with a proper
// authentication system, possibly using JWTs or another secure method.
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // For now, we'll check for an "admin-token" in the headers
    const adminToken = req.headers['admin-token'];

    if (adminToken === process.env.ADMIN_SECRET_TOKEN) {
        next();
    } else {
        throw new NotAuthorizedError();
    }
};