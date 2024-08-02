import dotenv from "dotenv";
import fs from "fs";

if (process.env.NODE_ENV === "DEVELOPMENT") {
    if (fs.existsSync(".env.development")) {
        dotenv.config({ path: ".env.development" });
    }
} else {
    if (fs.existsSync(".env.production")) {
        dotenv.config({ path: ".env.production" });
    }
}
console.log('process.env.ENVIRONMENT', process.env.ENVIRONMENT);

// Required environment variables
const requiredEnvVars = [
    'MONGODB_CONNECTION_URL',
    'SOLANA_RPC_URL',
    'CAMPAIGN_PROGRAM_ID',
    'IPFS_NODE_URL',
    'HIGH_TABLE_PROGRAM_ID'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} must be defined in the environment`);
    }
}

// Optional environment variables with defaults
process.env.MAX_CAMPAIGN_DURATION = process.env.MAX_CAMPAIGN_DURATION || '90'; // 90 days
process.env.MIN_CONTRIBUTION_AMOUNT = process.env.MIN_CONTRIBUTION_AMOUNT || '0.1'; // 0.1 SOL