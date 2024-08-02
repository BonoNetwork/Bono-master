import {
  ConfirmedSignaturesForAddress2Options,
  Connection,
  ConnectionConfig,
  ParsedTransactionWithMeta,
  PublicKey,
} from "@solana/web3.js";

export const maxSupportedTransactionVersion = 2;

let connectionPool: Connection[] = [];
const MAX_POOL_SIZE = 5; // Adjust based on your needs

export function getConnection(): Connection {
  if (connectionPool.length < MAX_POOL_SIZE) {
    const newConn = createNewConnection();
    connectionPool.push(newConn);
    return newConn;
  }
  return connectionPool[Math.floor(Math.random() * connectionPool.length)];
}

function createNewConnection(): Connection {
  const config: ConnectionConfig = {};
  if (process.env.SOLANA_RPC_KEY_SECRET) {
    config.httpHeaders = { Authorization: process.env.SOLANA_RPC_KEY_SECRET };
  }
  return new Connection(process.env.SOLANA_RPC || "", config);
}

interface Opt extends ConfirmedSignaturesForAddress2Options {
  onTransaction?: (tx: ParsedTransactionWithMeta) => Promise<void>;
}

export async function fetchWeb3Transactions(
  account: string,
  opt?: Opt
): Promise<ParsedTransactionWithMeta[] | null> {
  const conn = getConnection();
  try {
    const signatures = await conn.getConfirmedSignaturesForAddress2(
      new PublicKey(account),
      {
        limit: opt?.limit,
        before: opt?.before,
        until: opt?.until,
      },
      "finalized"
    );

    if (signatures) {
      const txs: ParsedTransactionWithMeta[] = [];
      const oldestToLatest = signatures.reverse();

      for (let i = 0; i < oldestToLatest.length; i++) {
        const signature = oldestToLatest[i];
        const tx = await conn.getParsedTransaction(signature.signature, {
          commitment: "finalized",
          maxSupportedTransactionVersion,
        });
        if (!tx) {
          continue;
        }
        opt?.onTransaction && (await opt.onTransaction(tx));

        txs.push(tx);
      }
      return txs;
    }
    return null;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function fetchCampaignTransactions(
  campaignAddress: string,
  opt?: Opt
): Promise<ParsedTransactionWithMeta[] | null> {
  const allTxs = await fetchWeb3Transactions(campaignAddress, opt);
  if (!allTxs) return null;

  // Filter for campaign-related transactions
  return allTxs.filter(tx => {
    // Check if the transaction involves the campaign address
    const involvesCampaignAddress = tx.transaction.message.accountKeys.some(
      key => key.pubkey.toString() === campaignAddress
    );

    // Check if the transaction involves the campaign program
    const involvesCampaignProgram = tx.transaction.message.accountKeys.some(
      key => key.pubkey.toString() === process.env.CAMPAIGN_PROGRAM_ID
    );

    // Check for specific instruction types related to campaigns
    const hasCampaignInstructions = tx.transaction.message.instructions.some(
      instruction => {
        // You'll need to define these based on your specific program instructions
        const campaignInstructionTypes = ['createCampaign', 'contribute', 'withdraw', 'updateStatus'];
        return campaignInstructionTypes.includes(instruction.parsed?.type);
      }
    );

    return involvesCampaignAddress && (involvesCampaignProgram || hasCampaignInstructions);
  });
}