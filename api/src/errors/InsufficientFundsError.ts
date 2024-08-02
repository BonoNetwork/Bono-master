import { CustomError } from "./CustomError";

export class InsufficientFundsError extends CustomError {
    statusCode = 400;

    constructor(public required: number, public available: number) {
        super(`Insufficient funds: Required ${required}, Available ${available}`);

        Object.setPrototypeOf(this, InsufficientFundsError.prototype);
    }

    serializeErrors() {
        return [{ message: this.message, required: this.required, available: this.available }];
    }
}