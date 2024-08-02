 
# Bono Campaign Management API

## Overview

The Bono Campaign Management API is a robust backend service designed to facilitate the creation, management, and participation in legal fundraising campaigns on the Solana blockchain. This API allows for the creation of campaigns, contributions from supporters, and management of campaign statuses by authorized High Table members.

## Table of Contents

1. [Setup](#setup)
2. [Environment Variables](#environment-variables)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Error Handling](#error-handling)
6. [Models](#models)
7. [Solana Integration](#solana-integration)
8. [IPFS Storage](#ipfs-storage)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/bono-campaign-api.git
   ```

2. Install dependencies:
   ```
   cd bono-campaign-api
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables) section).

4. Run the development server:
   ```
   npm run dev
   ```

5. For production, build and start:
   ```
   npm run build
   npm start
   ```

## Environment Variables

Create a `.env.development` and `.env.production` file in the root directory with the following variables:

```
ENVIRONMENT=DEVELOPMENT or PRODUCTION
MONGODB_CONNECTION_URL=your_mongodb_connection_string
SOLANA_RPC_URL=your_solana_rpc_url
CAMPAIGN_PROGRAM_ID=your_solana_program_id
IPFS_NODE_URL=your_ipfs_node_url
HIGH_TABLE_PROGRAM_ID=your_high_table_program_id
MAX_CAMPAIGN_DURATION=90
MIN_CONTRIBUTION_AMOUNT=0.1
```

## API Endpoints

### Campaigns

- `POST /api/v1/campaigns`: Create a new campaign
- `GET /api/v1/campaigns`: Get all campaigns
- `GET /api/v1/campaigns/:id`: Get a specific campaign
- `POST /api/v1/campaigns/:id/contribute`: Contribute to a campaign
- `PUT /api/v1/campaigns/:id/status`: Update campaign status (High Table members only)

### High Table

- `POST /api/v1/high-table/members`: Add a new High Table member
- `GET /api/v1/high-table/members`: Get all High Table members
- `GET /api/v1/high-table/members/:walletAddress`: Get a specific High Table member
- `PUT /api/v1/high-table/members/:walletAddress`: Update a High Table member
- `DELETE /api/v1/high-table/members/:walletAddress`: Remove a High Table member

## Authentication

Authentication is required for most endpoints. Use a bearer token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API uses standard HTTP status codes. Errors are returned in the following format:

```json
{
  "errors": [
    {
      "message": "Error message",
      "field": "Field name (if applicable)"
    }
  ]
}
```

## Models

### Campaign

```typescript
{
  id: string;
  title: string;
  description: string;
  host: string; // wallet address of the creator
  walletAddress: string; // campaign's wallet address
  goalAmount: number;
  currentAmount: number;
  endDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'FUNDED' | 'IN_PROGRESS' | 'WON' | 'LOST' | 'SETTLED';
  contributors: Array<{
    address: string;
    amount: number;
    date: Date;
  }>;
}
```

### High Table Member

```typescript
{
  walletAddress: string;
  firmName: string;
  jurisdiction: string[];
  legalExpertise: string[];
  reputation: number;
  casesHandled: number;
  joinDate: Date;
}
```

## Solana Integration

The API integrates with the Solana blockchain for:
- Creating campaign NFTs
- Managing campaign tokens
- Processing contributions
- Handling token redemptions

Ensure your Solana wallet is properly set up and funded for interacting with the API.

## IPFS Storage

Campaign documents and images are stored on IPFS. The API handles the upload and retrieval of these files. Public gateway URLs are provided for accessing the files.

---

For more detailed information about each endpoint, including request/response formats and required permissions, please refer to the API documentation or contact the development team.