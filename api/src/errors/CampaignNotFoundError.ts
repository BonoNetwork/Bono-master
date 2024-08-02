import { CustomError } from "./CustomError";

export class CampaignNotFoundError extends CustomError {
    statusCode = 404;

    constructor(public campaignId: string) {
        super(`Campaign with ID ${campaignId} not found`);

        Object.setPrototypeOf(this, CampaignNotFoundError.prototype);
    }

    serializeErrors() {
        return [{ message: this.message }];
    }
}