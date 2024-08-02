import { kSupportedTokens, type Token } from '@/composables/Tokens';
import * as web3 from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { showToast } from '@/composables/toast';

export interface Amount {
    amount: number,
    uiAmount: number
}    


export class SolanaManager {

static makeDonation(arg0: any, caseOwner: string, currency: string, value: any, value1: any, value2: any) {
throw new Error('Method not implemented.');
}
    static newConnection(): web3.Connection {
        return new web3.Connection(import.meta.env.VITE_APP_SOLANA_RPC!);
    }

    static async getWalletBalance(walletAddress: string, tokenAddress: string): Promise<Amount> {
        const web3Conn = this.newConnection();
        const walletPublicKey = new web3.PublicKey(walletAddress);

        try {
            if (tokenAddress.toLowerCase() === 'sol') {
                const balance = await web3Conn.getBalance(walletPublicKey);
                return {
                    amount: balance, 
                    uiAmount: Math.round(100 * balance / web3.LAMPORTS_PER_SOL) / 100
                };
            } else {
                const tokenPublicKey = new web3.PublicKey(tokenAddress);
                const accounts = await web3Conn.getParsedTokenAccountsByOwner(walletPublicKey, {mint: tokenPublicKey});
                
                if (accounts.value.length === 0) {
                    return { amount: 0, uiAmount: 0 };
                }
                
                return {
                    amount: +(accounts.value[0].account.data.parsed.info.tokenAmount.amount), 
                    uiAmount: +(accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount)
                };
            }
        } catch (err) {
            console.error('getWalletBalance error:', err);
            showToast('Failed to fetch wallet balance', 'error');
            return { amount: 0, uiAmount: 0 };
        }
    }

    static async createTransaction(feePayer: web3.PublicKey, blockhash?: string, addPriorityFee: boolean = true): Promise<web3.Transaction> {
        let transaction = new web3.Transaction();
        transaction.feePayer = feePayer;
        if (blockhash) { transaction.recentBlockhash = blockhash; }
        if (addPriorityFee) { transaction = await this.addPriorityFeeToTransaction(transaction); }
        return transaction;
    }

    static async addPriorityFeeToTransaction(transaction: web3.Transaction): Promise<web3.Transaction> {
        // TODO: Implement dynamic fee estimation
        transaction.add(web3.ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 100000,
        }));
        return transaction;
    }

    tatic async makeDonation(fromWalletAddress: string, toWalletAddress: string, tokenAddress: string, amount: number, name?: string, comment?: string): Promise<web3.Transaction | undefined> {
        console.log('makeDonation', fromWalletAddress, toWalletAddress, tokenAddress, amount, name, comment);

        try {
            const web3Conn = this.newConnection();
            const blockhash = (await web3Conn.getLatestBlockhash()).blockhash;
            const transaction = await this.createTransaction(new web3.PublicKey(fromWalletAddress), blockhash);

            const fromPublicKey = new web3.PublicKey(fromWalletAddress);
            const toPublicKey = new web3.PublicKey(toWalletAddress);
            const token = kSupportedTokens.find((token) => token.mintAddress === tokenAddress);
            if (!token) {
                throw new Error('Unsupported token');
            }

            const instructions: web3.TransactionInstruction[] = [];

            const amountInLamports = Math.round(amount * (10 ** token.decimals));
            if (tokenAddress.toLowerCase() === 'sol') {
                instructions.push(
                    web3.SystemProgram.transfer({
                        fromPubkey: fromPublicKey,
                        toPubkey: toPublicKey,
                        lamports: amountInLamports
                    })
                );
            } else {
                const tokenPublicKey = new web3.PublicKey(tokenAddress);
                const splInstructions = await this.createSplTransferInstructions(web3Conn, tokenPublicKey, amount, token.decimals, fromPublicKey, toPublicKey, fromPublicKey);
                if (splInstructions) {
                    instructions.push(...splInstructions);
                } else {
                    throw new Error('Failed to create SPL transfer instructions');
                }
            }

            // Add platform fee transfer
            instructions.push(
                web3.SystemProgram.transfer({
                    fromPubkey: fromPublicKey,
                    toPubkey: new web3.PublicKey(process.env.PLATFORM_FEE_ADDRESS!),
                    lamports: 0.001 * web3.LAMPORTS_PER_SOL
                })
            );

            // Add memo if name or comment is provided
            if (name || comment) {
                const memo = `${name || ''}||${comment || ''}`;
                instructions.push(
                    new web3.TransactionInstruction({
                        data: Buffer.from(memo),
                        keys: [],
                        programId: new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    })
                );
            }

            transaction.add(...instructions);
            return transaction;
        } catch (error) {
            console.error('makeDonation error:', error);
            showToast('Failed to create donation transaction', 'error');
            return undefined;
        }
    }

    static async claimDonations(fromWalletAddress: string, toWalletAddress: string, tokenAddress: string, amount: number): Promise<web3.Transaction | undefined> {
        console.log('claimDonations', fromWalletAddress, toWalletAddress, tokenAddress, amount);

        try {
            const web3Conn = this.newConnection();
            const blockhash = (await web3Conn.getLatestBlockhash()).blockhash;
            const transaction = await this.createTransaction(new web3.PublicKey(toWalletAddress), blockhash);

            const fromPublicKey = new web3.PublicKey(fromWalletAddress);
            const toPublicKey = new web3.PublicKey(toWalletAddress);
            const token = kSupportedTokens.find((token) => token.mintAddress === tokenAddress);
            if (!token) {
                throw new Error('Unsupported token');
            }

            const instructions: web3.TransactionInstruction[] = [];

            const amountInLamports = Math.round(amount * (10 ** token.decimals));
            if (tokenAddress.toLowerCase() === 'sol') {
                instructions.push(
                    web3.SystemProgram.transfer({
                        fromPubkey: fromPublicKey,
                        toPubkey: toPublicKey,
                        lamports: amountInLamports
                    })
                );
            } else {
                const tokenPublicKey = new web3.PublicKey(tokenAddress);
                const splInstructions = await this.createSplTransferInstructions(web3Conn, tokenPublicKey, amount, token.decimals, fromPublicKey, toPublicKey, toPublicKey);
                if (splInstructions) {
                    instructions.push(...splInstructions);
                } else {
                    throw new Error('Failed to create SPL transfer instructions');
                }
            }

            transaction.add(...instructions);
            return transaction;
        } catch (error) {
            console.error('claimDonations error:', error);
            showToast('Failed to create claim transaction', 'error');
            return undefined;
        }
    }

    static async createSplTransferInstructions(web3Conn: web3.Connection, splTokenMintPublicKey: web3.PublicKey, amount: number, decimals: number, fromPublicKey: web3.PublicKey, toPublicKey: web3.PublicKey, feePayerPublicKey: web3.PublicKey): Promise<web3.TransactionInstruction[] | undefined>{
        try {
            const fromTokenAddress = await spl.getAssociatedTokenAddress(splTokenMintPublicKey, fromPublicKey);
            const toTokenAddress = await spl.getAssociatedTokenAddress(splTokenMintPublicKey, toPublicKey);

            const instructions: web3.TransactionInstruction[] = [];

            const instruction1 = await this.getInstrucionToCreateTokenAccount(web3Conn, splTokenMintPublicKey, fromTokenAddress, fromPublicKey, feePayerPublicKey);
            if (instruction1 != undefined){
                instructions.push(instruction1);
            }

            const instruction2 = await this.getInstrucionToCreateTokenAccount(web3Conn, splTokenMintPublicKey, toTokenAddress, toPublicKey, feePayerPublicKey);
            if (instruction2 != undefined){
                instructions.push(instruction2);
            }

            instructions.push(
                spl.createTransferInstruction(
                    fromTokenAddress, 
                    toTokenAddress, 
                    fromPublicKey, 
                    Math.floor(amount * 10**decimals)
                )
            );
        
            return instructions;
        }
        catch (err: any) {
            console.error(err.message);
        }
        return undefined;
    }  

    static async getInstrucionToCreateTokenAccount(
        web3Conn: web3.Connection, 
        tokenMintPublicKey: web3.PublicKey, 
        tokenAccountAddressPublicKey: web3.PublicKey, 
        ownerAddressPublicKey: web3.PublicKey, 
        feePayerPublicKey: web3.PublicKey
    ): Promise<web3.TransactionInstruction | undefined> {

        try {
            const account = await spl.getAccount(
                web3Conn, 
                tokenAccountAddressPublicKey, 
                undefined, 
                spl.TOKEN_PROGRAM_ID
            );
        } catch (error: unknown) {
            if (error instanceof spl.TokenAccountNotFoundError || error instanceof spl.TokenInvalidAccountOwnerError) {
                return spl.createAssociatedTokenAccountInstruction(
                    feePayerPublicKey,
                    tokenAccountAddressPublicKey,
                    ownerAddressPublicKey,
                    tokenMintPublicKey,
                    spl.TOKEN_PROGRAM_ID,
                    spl.ASSOCIATED_TOKEN_PROGRAM_ID
                );
            } else {
                throw error;
            }
        }
    }

    static async getContributors(boxWalletAddress: string, token: Token): Promise<{
        contributors: {wallet: string, amount: string, name?: string, comment?: string}[],
        withdrawn: number,
        transactionsCount?: number,
        uniqueWalletsCount?: number
    }> {
        console.log('getContributors', boxWalletAddress);
        const web3Conn = this.newConnection();
        const boxPublicKey = new web3.PublicKey(boxWalletAddress);
        let withdrawn = 0;
        let transactionsCount = 0;
        const uniqueWallets: string[] = [];
        const contributors: {wallet: string, amount: string, name?: string, comment?: string}[] = [];

        try {
            const signatures = await web3Conn.getSignaturesForAddress(boxPublicKey, {limit: 1000});
            if (signatures && signatures.length > 0) {
                const signs = signatures.map((signature) => signature.signature);
                const transactions = await web3Conn.getParsedTransactions(signs);
                if (transactions && transactions.length > 0) {
                    for (const transaction of transactions) {
                        if (transaction && !transaction.meta?.err) {
                            const instructions = transaction.transaction.message.instructions;
                            let walletAddress = '';
                            let lamports = 0;
                            let memo = '';

                            for (const instruction of instructions) {
                                const inst: any = instruction;
                                if (inst.program === 'spl-memo') {
                                    memo = inst.parsed;
                                } else if (inst.program === 'system' && inst.parsed.type === 'transfer') {
                                    if (inst.parsed.info.lamports > 0) {
                                        if (inst.parsed.info.destination === boxWalletAddress) {
                                            walletAddress = inst.parsed.info.source;
                                            lamports = inst.parsed.info.lamports;
                                            transactionsCount++;
                                            if (!uniqueWallets.includes(walletAddress)) {
                                                uniqueWallets.push(walletAddress);
                                            }
                                        } else if (inst.parsed.info.source === boxWalletAddress) {
                                            withdrawn += inst.parsed.info.lamports;
                                        }
                                    }
                                }
                            }

                            if (lamports > 0) {
                                const [name, comment] = memo.split('||');
                                contributors.push({
                                    wallet: walletAddress,
                                    amount: `${(lamports / (10 ** token.decimals)).toFixed(6)} ${token.name}`,
                                    name: name || undefined,
                                    comment: comment || undefined
                                });
                            }
                        }
                    }
                }
            }

            return {
                contributors,
                withdrawn,
                transactionsCount,
                uniqueWalletsCount: uniqueWallets.length
            };
        } catch (error) {
            console.error('getContributors error:', error);
            showToast('Failed to fetch contributors', 'error');
            return {
                contributors: [],
                withdrawn: 0,
                transactionsCount: 0,
                uniqueWalletsCount: 0
            };
        }
    }
    static async contributeToCampaign(
        fromWalletAddress: string,
        campaignAddress: string,
        tokenAddress: string,
        amount: number,
        name?: string,
        comment?: string
      ): Promise<string | undefined> {
        console.log('contributeToCampaign', fromWalletAddress, campaignAddress, tokenAddress, amount, name, comment);
    
        const web3Conn = this.newConnection();
        const blockhash = (await web3Conn.getLatestBlockhash()).blockhash;
        const transaction = await this.createTransaction(new web3.PublicKey(fromWalletAddress), blockhash);
    
        const fromPublicKey = new web3.PublicKey(fromWalletAddress);
        const campaignPublicKey = new web3.PublicKey(campaignAddress);
        const token = kSupportedTokens.find((token) => token.mintAddress == tokenAddress);
        if (!token) { return undefined; }
    
        const instructions: web3.TransactionInstruction[] = [];
    
        const amountInLamports = Math.round(amount * (10 ** token.decimals));
        if (tokenAddress.toLowerCase() === 'sol') {
          instructions.push(
            web3.SystemProgram.transfer({
              fromPubkey: fromPublicKey,
              toPubkey: campaignPublicKey,
              lamports: amountInLamports
            })
          );
        } else {
          const tokenPublicKey = new web3.PublicKey(tokenAddress);
          const instr = await this.createSplTransferInstructions(web3Conn, tokenPublicKey, amount, token.decimals, fromPublicKey, campaignPublicKey, fromPublicKey);
          if (instr) {
            instructions.push(...instr);
          }
        }
    
        // Add platform fee transfer (if applicable)
        instructions.push(
          web3.SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: new web3.PublicKey(process.env.PLATFORM_FEE_ADDRESS!),
            lamports: 0.001 * web3.LAMPORTS_PER_SOL
          })
        );
    
        // Add memo for name and comment
        if (name || comment) {
          const memo = `${name || ''}||${comment || ''}`;
          instructions.push(
            new web3.TransactionInstruction({
              data: Buffer.from(memo),
              keys: [],
              programId: new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            })
          );
        }
    
        transaction.add(...instructions);
    
        try {
          const signature = await web3.sendAndConfirmTransaction(web3Conn, transaction, []);
          return signature;
        } catch (error) {
          console.error('Error in contributeToCampaign:', error);
          return undefined;
        }
      }
}