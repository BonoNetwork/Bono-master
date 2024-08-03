import nacl from "tweetnacl";
import * as web3 from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { getConnection } from "../../lib/solana";
import axios from "axios";
import { Metaplex } from "@metaplex-foundation/js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createNoopSigner, createSignerFromKeypair, generateSigner, GenericFile, KeypairSigner, publicKey, signerIdentity, sol, TransactionBuilder, Umi, unwrapOption } from "@metaplex-foundation/umi";
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import * as mplBubblegum from "@metaplex-foundation/mpl-bubblegum";
import { addMemo, setComputeUnitPrice, transferSol } from "@metaplex-foundation/mpl-toolbox";
import { fromWeb3JsPublicKey, toWeb3JsLegacyTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { WalletModel } from "../../models/types";
import base58 from "bs58";
import { HeliusAsset } from "./HeliusTypes";
import { HeliusManager } from "./HeliusManager";
import { Campaign } from "../../entities/Campaign";
import { HighTable } from "../../entities/HighTable";
import { mplCore } from "@metaplex-foundation/mpl-core";

export interface CreateTransactionResponse {
    tx: web3.Transaction,
    blockhash: web3.BlockhashWithExpiryBlockHeight,
}

export enum DELEGATE_TYPE {
    SaleV1 = 'SaleV1',
    TransferV1 = 'TransferV1',
    UtilityV1 = 'UtilityV1',
    StakingV1 = 'StakingV1',
    StandardV1 = 'StandardV1',
}

export class SolanaManager {

    static verify(message: string, walletId: string, signature: string): boolean {
        try {
            return this.verifyMessage(message, walletId, signature);
        }
        catch (error){
            console.error(error);
        }

        try {
            const transaction = web3.Transaction.from(Buffer.from(JSON.parse(signature)));

            const isVerifiedSignatures = transaction.verifySignatures();

            if (!isVerifiedSignatures) {
                return false;
            }

            for (const sign of transaction.signatures) {
                if (sign.publicKey.toBase58() == walletId){
                    return true;
                }
            }            
        }
        catch (error){
            console.error(error);
        }

        return false;
    }

    static verifyMessage(message: string, walletId: string, signature: string): boolean {
        const messageBytes = new TextEncoder().encode(message);
        const publicKeyBytes = base58.decode(walletId);
        const signatureBytes = base58.decode(signature);

        return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    }

    static async partialSignAndSend(web3Conn: web3.Connection, transaction: web3.Transaction, privateKey?: web3.Keypair): Promise<string | undefined> {
        if (privateKey){
            transaction.partialSign(privateKey);
        }

        const isVerifiedSignatures = transaction.verifySignatures();

        const signatures = transaction.signatures;
        for (const signature of signatures) {
            if (!signature.signature){
                console.log(signature.publicKey.toBase58(), 'have not signed!!!');
            }
        }

        console.log('isVerifiedSignatures', isVerifiedSignatures);

        if (isVerifiedSignatures){
            const wireTransaction = transaction.serialize();
            const signature = await web3Conn.sendRawTransaction(
                wireTransaction
            );    
            console.log('signature', signature);
            return signature;    
        }
    
        return undefined;
    }

    static async isBlockhashValid(blockhash: string) : Promise<boolean | undefined> {
        const { data } = await axios.post(process.env.SOLANA_RPC!, {
            "id": 45,
            "jsonrpc": "2.0",
            "method": "isBlockhashValid",
            "params": [
                blockhash,
                {
                    "commitment": "finalized"
                }
            ]
        });

        // console.log('isBlockhashValid', data);

        if (data!=undefined && data.result!=undefined && data.result.value!=undefined){
            return data.result.value;
        }

        return data.result.value;
    }

    static createWallet(): WalletModel {
        const keyPair = web3.Keypair.generate();

        return {
            publicKey: keyPair.publicKey.toString(),
            privateKey: Array.from(keyPair.secretKey),
        }
    }

    static async isTransactionContainSigner(transaction: web3.Transaction, signerAddress: string, hasToBeSigned: boolean = true): Promise<boolean> {
        for (const signature of transaction.signatures) {
            if (signature.publicKey.toBase58() == signerAddress){
                if (!hasToBeSigned) { return true; }
                else if (hasToBeSigned && signature.signature){ return true; }
            }
        }

        return false;
    }

    static async createLockNftTransaction(web3Conn: web3.Connection, mintPublicKeys: web3.PublicKey[], ownerWalletAddress: string, escrowPrivateKey: web3.Keypair, signerPublicKey?: web3.PublicKey, blockhash?: web3.BlockhashWithExpiryBlockHeight): Promise<CreateTransactionResponse | undefined>{
        console.log('----- createLockNftTransaction -----');

        const metaplex = new Metaplex(web3Conn);
        const umi = createUmi(process.env.SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());
        const ownerSigner = createNoopSigner(publicKey(ownerWalletAddress));
        const escrowKeypair = {
            publicKey: fromWeb3JsPublicKey(escrowPrivateKey.publicKey), 
            secretKey: escrowPrivateKey.secretKey,
        };
        const escrowSigner = createSignerFromKeypair(umi, escrowKeypair);
        umi.use(signerIdentity(ownerSigner));
        const utilityDelegate = escrowSigner;
        let transactionBuilder = await this.createUmiTransactionBuilder(umi);

        for (const mintPublicKey of mintPublicKeys) {
            const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
            if (!nft){
                console.error(`mitim createLockNftTransaction (nft not found) ownerWalletAddress: ${ownerWalletAddress}, mintPublicKey: ${mintPublicKey.toBase58()}`);
                return;
            }
            const mint = publicKey(mintPublicKey);
    
            transactionBuilder = transactionBuilder.add(mplTokenMetadata.delegateUtilityV1(umi, {
                mint,
                delegate: utilityDelegate.publicKey,
                tokenStandard: mplTokenMetadata.TokenStandard.ProgrammableNonFungible,
                authority: ownerSigner,
                authorizationRules: nft.programmableConfig?.ruleSet ? publicKey(nft.programmableConfig.ruleSet) : undefined,
            }));
            transactionBuilder = transactionBuilder.add(mplTokenMetadata.lockV1(umi, {
                mint,
                authority: utilityDelegate,
                tokenStandard: mplTokenMetadata.TokenStandard.ProgrammableNonFungible,
            }));    
        }

        transactionBuilder = transactionBuilder.add(
            transferSol(umi, {
                source: ownerSigner,
                destination: escrowKeypair.publicKey,
                amount: sol(0.001),
            })
        );

        if (signerPublicKey){
            transactionBuilder = transactionBuilder.add(
                transferSol(umi, {
                    source: createNoopSigner(publicKey(signerPublicKey)),
                    destination: publicKey(signerPublicKey),
                    amount: sol(0),
                })
            );
        }

        if (!blockhash){
            blockhash = await web3Conn.getLatestBlockhash();
        }
        transactionBuilder = transactionBuilder.setFeePayer(ownerSigner);
        transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        const transaction = transactionBuilder.build(umi);
        const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);

        return {tx: web3jsTransaction, blockhash: blockhash};
    }

    static async createUnlockNftTransaction(web3Conn: web3.Connection, mintPublicKeys: web3.PublicKey[], ownerWalletAddress: string, escrowPrivateKey: web3.Keypair, signerPublicKey?: web3.PublicKey): Promise<CreateTransactionResponse | undefined>{
        console.log('----- createUnlockNftTransaction -----');

        const metaplex = new Metaplex(web3Conn);
        const umi = createUmi(process.env.SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());
        const ownerSigner = createNoopSigner(publicKey(ownerWalletAddress));
        const escrowKeypair = {
            publicKey: fromWeb3JsPublicKey(escrowPrivateKey.publicKey), 
            secretKey: escrowPrivateKey.secretKey,
        };
        const escrowSigner = createSignerFromKeypair(umi, escrowKeypair);
        umi.use(signerIdentity(ownerSigner));
        const utilityDelegate = escrowSigner;
        let transactionBuilder = await this.createUmiTransactionBuilder(umi);


        for (const mintPublicKey of mintPublicKeys) {
            const nft = await metaplex.nfts().findByMint({ mintAddress: new web3.PublicKey(mintPublicKey) });
            if (!nft){
                console.error(`mitim createUnlockNftTransaction (nft not found) ownerWalletAddress: ${ownerWalletAddress}, mintPublicKey: ${mintPublicKey.toBase58()}`);
                return;
            }
            const mint = publicKey(mintPublicKey);
    
            transactionBuilder = transactionBuilder.add(mplTokenMetadata.unlockV1(umi, {
                mint,
                authority: utilityDelegate,
                tokenStandard: mplTokenMetadata.TokenStandard.ProgrammableNonFungible,
            }));
            transactionBuilder = transactionBuilder.add(mplTokenMetadata.revokeUtilityV1(umi, {
                mint,
                delegate: utilityDelegate.publicKey,
                tokenStandard: mplTokenMetadata.TokenStandard.ProgrammableNonFungible,
                authority: ownerSigner,
                authorizationRules: nft.programmableConfig?.ruleSet ? publicKey(nft.programmableConfig.ruleSet) : undefined,
            }));
        }

        if (signerPublicKey){
            transactionBuilder = transactionBuilder.add(
                transferSol(umi, {
                    source: createNoopSigner(publicKey(signerPublicKey)),
                    destination: publicKey(signerPublicKey),
                    amount: sol(0),
                })
            );
        }


        const blockhash = await web3Conn.getLatestBlockhash();
        
        transactionBuilder = transactionBuilder.setFeePayer(ownerSigner);
        transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        const transaction = transactionBuilder.build(umi);
        const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);

        return {tx: web3jsTransaction, blockhash: blockhash};
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

    static async isNftFrozen(mintToken: string, log?: string): Promise<boolean | undefined>{
        const umi = createUmi(process.env.SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());

        let isLocked: boolean | undefined = undefined;
        
        try{
            const asset = await mplTokenMetadata.fetchDigitalAssetWithTokenByMint(umi, publicKey(mintToken));
            // console.log('asset:', asset);

            if (unwrapOption(asset.metadata.tokenStandard) == mplTokenMetadata.TokenStandard.ProgrammableNonFungible){    
                // console.log('isNftFrozen:', mintToken, 'is pNFT');

                const tokenRecord = asset.tokenRecord;
                // if (tokenRecord?.delegateRole && unwrapOption(tokenRecord?.delegateRole) === mpl.TokenDelegateRole.Migration){
                //     console.log(log, mintToken, 'tokenRecord.delegateRole:', tokenRecord?.delegateRole);
                // }
                isLocked = tokenRecord?.state == mplTokenMetadata.TokenState.Locked ? true : false;
    
                if (tokenRecord == undefined){
                    console.log(log, mintToken, '!!!!!!!!! tokenRecord is undefined !!!!!!!!!!!');
                }
            }
            else{
                // console.log('isNftFrozen:', mintToken, 'is NFT');
                //TODO: implement this for NFT
            }

            // console.log('mintToken:', mintToken, 'isLocked:', isLocked);        
        }
        catch (err: any) {
            console.error(err.message);
        }

        return isLocked;
    }

    static async closeEmptyTokenAccounts(keypair: web3.Keypair){
        const web3Conn = getConnection();

        // Split an array into chunks of length `chunkSize`
        const chunks = <T>(array: T[], chunkSize = 10): T[][] => {
            const res: T[][] = [];
            for (let currentChunk = 0; currentChunk < array.length; currentChunk += chunkSize) {
                res.push(array.slice(currentChunk, currentChunk + chunkSize));
            }
            return res;
        };
        
        // Get all token accounts of `wallet`
        const tokenAccounts = await web3Conn.getParsedTokenAccountsByOwner(keypair.publicKey, { programId: spl.TOKEN_PROGRAM_ID });
        
        // You can only close accounts that have a 0 token balance. Be sure to filter those out!
        const filteredAccounts = tokenAccounts.value.filter(account => account.account.data.parsed.info.tokenAmount.uiAmount === 0);
        
        console.log('filteredAccounts.length:', filteredAccounts.length);

        const transactions: web3.Transaction[] = [];
        
        const recentBlockhash = (await web3Conn.getLatestBlockhash()).blockhash;
        
        const chunksArr = chunks(filteredAccounts);

        for (const chunk of chunksArr) {
            const txn = await this.createTransaction(keypair.publicKey, recentBlockhash);
            for (const account of chunk) {
                // Add a `closeAccount` instruction for every token account in the chunk
                txn.add(spl.createCloseAccountInstruction(account.pubkey, new web3.PublicKey('FUCww3SgAmqiP4CswfgY2r2Nsf6PPzARrXraEnGCn4Ln'), keypair.publicKey));
            }
            transactions.push(txn);
        }

        console.log('transactions.length:', transactions.length);
        // Sign and send all transactions
        for (const tx of transactions) {
            const signedTransaction = web3.sendAndConfirmTransaction(web3Conn, tx, [keypair]);    
            // console.log('signedTransaction', signedTransaction);        
            
            //sleep 500 ms
            await new Promise(resolve => setTimeout(resolve, 500));
        }

    }

    // static async burnNft(mintToken: string, keypair: web3.Keypair) {
    //     const web3Conn = getConnection();
    //     const metaplex = new Metaplex(web3Conn);

    //     const nft = await metaplex.nfts().findByMint({mintAddress: new web3.PublicKey(mintToken)});

    //     metaplex.use(mpljsWalletAdapterIdentity({
    //         publicKey: keypair.publicKey,
    //         signTransaction: async (tx) => tx,
    //     }));    
    
    //     const blockhash = await web3Conn.getLatestBlockhash();

    //     const txBuilder = metaplex.nfts().builders().delete({
    //         mintAddress: new web3.PublicKey(mintToken),            
    //         collection: nft.collection?.address,
    //     });

    //     const tx = txBuilder.toTransaction(blockhash);

    //     console.log('burnNft tx', tx);
    //     const result = await SolanaManager.partialSignAndSend(web3Conn, tx, keypair);

    //     console.log('burnNft result:', result);
    // }

    static async getNFTAccountBalance(mintToken: string, walletAddress: string): Promise<number> {
        // console.log(`----- getNFTAccountBalance ${mintToken} -----`);
        let amount = 0;

        const web3Conn = getConnection();
        const nftPublicKey = new web3.PublicKey(mintToken);
        const walletPublicKey = new web3.PublicKey(walletAddress);

        try {
            const umi = createUmi(process.env.SOLANA_RPC!);
            umi.use(mplTokenMetadata.mplTokenMetadata());
    
            try{
                const pubKeys: string[] = [];
                const asset = await mplTokenMetadata.fetchDigitalAssetWithTokenByMint(umi, publicKey(mintToken));
                // console.log('asset:', asset);

                if (!pubKeys.includes(asset.metadata.publicKey.toString())){
                    pubKeys.push(asset.metadata.publicKey.toString());
                }
                if (asset.edition && !pubKeys.includes(asset.edition.publicKey.toString())){
                    pubKeys.push(asset.edition.publicKey.toString());
                }
                if (asset.token && !pubKeys.includes(asset.token.publicKey.toString())){
                    pubKeys.push(asset.token.publicKey.toString());
                }

                // console.log('pubKeys:', pubKeys);

                for (const pubKey of pubKeys) {
                    const tmpBalance = await web3Conn.getBalance(new web3.PublicKey(pubKey));
                    amount += tmpBalance;
                }
            }
            catch (err: any){
                // console.log('asset error:', err.message);

                const tokenAddress = await spl.getAssociatedTokenAddress(nftPublicKey, walletPublicKey);
                if (tokenAddress){
                    const tmpBalance = await web3Conn.getBalance(tokenAddress);
                    amount += tmpBalance;
                }
            }
        }
        catch (err: any) { /* empty */ }

        return amount / web3.LAMPORTS_PER_SOL;
    }

    static async createBurnAssetTransaction(web3Conn: web3.Connection, asset: HeliusAsset, signer: web3.Keypair, memo?: string, blockhash?: web3.BlockhashWithExpiryBlockHeight): Promise<CreateTransactionResponse | undefined>{
        console.log('----- createBurnAssetTransaction -----');
        const ownerWalletAddress = asset.ownership.owner;
        const soloFeeWalletAddress = process.env.FEE_WALLET_ADDRESS!;

        const metaplex = new Metaplex(web3Conn);
        const umi = createUmi(process.env.SOLANA_RPC!);
        const ownerSigner = createNoopSigner(publicKey(ownerWalletAddress));
        umi.use(mplTokenMetadata.mplTokenMetadata());
        umi.use(signerIdentity(ownerSigner));
        umi.use(mplBubblegum.mplBubblegum());

        let transactionBuilder = await this.createUmiTransactionBuilder(umi);

        //TODO: implement burning for SPL tokens

        let tokenStandard: mplTokenMetadata.TokenStandard = mplTokenMetadata.TokenStandard.NonFungible;
        if (asset.interface == 'ProgrammableNFT'){
            tokenStandard = mplTokenMetadata.TokenStandard.ProgrammableNonFungible;
        }
        else if (asset.interface == 'V1_NFT' || asset.interface == 'Custom'){
            tokenStandard = mplTokenMetadata.TokenStandard.NonFungible;
        }

        if (asset.compression.compressed){
            //TODO: implement burning for cNFT
            // mplBubblegum.burn(umi, {
                
            // })
        }
        else {
            // implement burning for NFT & pNFT
            transactionBuilder = transactionBuilder.add(
                mplTokenMetadata.burnV1(umi, {
                    mint: publicKey(asset.id),
                    authority: ownerSigner,
                    tokenOwner: publicKey(ownerWalletAddress),
                    tokenStandard: tokenStandard,
                })
            );
        }

        transactionBuilder = transactionBuilder.add(
            transferSol(umi, {
                source: createNoopSigner(publicKey(ownerWalletAddress)),
                destination: publicKey(soloFeeWalletAddress),
                amount: sol(0.001),
            })
        );

        transactionBuilder = transactionBuilder.add(
            transferSol(umi, {
                source: createNoopSigner(publicKey(signer.publicKey)),
                destination: publicKey(signer.publicKey),
                amount: sol(0),
            })
        );

        if (memo){
            transactionBuilder = transactionBuilder.add(
                addMemo(umi, {
                    memo: memo,
                })
            );
        }

        if (!blockhash){
            blockhash = await web3Conn.getLatestBlockhash();
        }
        transactionBuilder = transactionBuilder.setFeePayer(ownerSigner);
        transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        const transaction = transactionBuilder.build(umi);
        const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);

        web3jsTransaction.partialSign(signer);

        return {tx: web3jsTransaction, blockhash: blockhash};
    }

    // static async createAirdropItemTransaction(web3Conn: web3.Connection, item: IAirdropItem, airdrop: IAirdrop): Promise<CreateTransactionResponse | undefined>{
    //     const blockhash = await web3Conn.getLatestBlockhash();

    //     const transaction = await this.createTransaction(new web3.PublicKey(airdrop.sender.publicKey), blockhash.blockhash);
    //     const splTokenMintPublicKey = new web3.PublicKey(airdrop.mintToken);

    //     const instructions = await this.createSplTransferInstructions(
    //         web3Conn, 
    //         splTokenMintPublicKey, 
    //         item.amount, 
    //         airdrop.decimals, 
    //         new web3.PublicKey(airdrop.sender.publicKey), 
    //         new web3.PublicKey(item.walletAddress), 
    //         new web3.PublicKey(airdrop.sender.publicKey)
    //     );

    //     if (instructions == undefined){
    //         return undefined;
    //     }

    //     transaction.add(
    //         ...instructions
    //     );

    //     const feeInstruction = this.createFeeInstruction(airdrop.sender.publicKey);
    //     if (feeInstruction){
    //         transaction.add(feeInstruction);
    //     }

    //     return {tx: transaction, blockhash: blockhash};
    // }

    static createFeeInstruction(walletAddress: string, fee: number = 0.001): web3.TransactionInstruction | undefined {
        if (!process.env.FEE_WALLET_ADDRESS){
            return undefined;
        }

        const soloFeeWalletAddress = process.env.FEE_WALLET_ADDRESS!;
        return web3.SystemProgram.transfer({
            fromPubkey: new web3.PublicKey(walletAddress),
            toPubkey: new web3.PublicKey(soloFeeWalletAddress),
            lamports: fee * web3.LAMPORTS_PER_SOL,
        })
    }

    static async getSplTokenHoldersSnapshot(mintAddress: string): Promise<{walletAddress: string, amount: number}[]> {
        const holders: {walletAddress: string, amount: number}[] = [];

        try {
            const response = await axios.post(process.env.SOLANA_RPC!, {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getProgramAccounts",
                "params": [
                    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    {
                        "encoding": "jsonParsed",
                        "filters": [
                            {
                                "dataSize": 165
                            },
                            {
                                "memcmp": {
                                    "offset": 0,
                                    "bytes": mintAddress
                                }
                            }
                        ]
                    }
                ]
            });
            console.log('Total holders: ', response.data.result.length);
            
            for (const item of response.data.result) {
                const holder = {
                    walletAddress: item.account.data.parsed.info.owner,
                    amount: +item.account.data.parsed.info.tokenAmount.uiAmount,
                };

                if (holder.amount > 0){
                    holders.push(holder);
                }
            }

        } catch (e) {
            console.log(`Error getting wallets. ${e}`);
        }

        return holders;
    }

    static async createTransaction(feePayer: web3.PublicKey, blockhash?: string, addPriorityFee: boolean = true): Promise<web3.Transaction> {
        let transaction = new web3.Transaction();
        transaction.feePayer = feePayer;
        if (blockhash) { transaction.recentBlockhash = blockhash; }
        if (addPriorityFee) { transaction = await this.addPriorityFeeToTransaction(transaction); }
        return transaction;
    }

    static async createUmiTransactionBuilder(umi: Umi, addPriorityFee: boolean = true): Promise<TransactionBuilder> {
        let transactionBuilder = new TransactionBuilder();
        if (addPriorityFee) { transactionBuilder = await this.addPriorityFeeToUmiTransaction(umi, transactionBuilder); }
        return transactionBuilder;
    }

    static async addPriorityFeeToTransaction(transaction: web3.Transaction): Promise<web3.Transaction>{
        const feeEstimate = await HeliusManager.getRecentPrioritizationFees();
        transaction.add(web3.ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: feeEstimate,
        }));
        return transaction;
    }
    
    static async addPriorityFeeToUmiTransaction(umi: Umi, transactionBuilder: TransactionBuilder): Promise<TransactionBuilder>{
        const feeEstimate = await HeliusManager.getRecentPrioritizationFees();
        transactionBuilder = transactionBuilder.add(setComputeUnitPrice(umi, { microLamports: feeEstimate }));
        return transactionBuilder;
    }

    static async createMintNftTransaction(web3Conn: web3.Connection, walletAddress: string): Promise<CreateTransactionResponse | undefined>{
        console.log('----- createMintNftTransaction -----');

        const metaplex = new Metaplex(web3Conn);
        const umi = createUmi(process.env.SOLANA_RPC!);
        //umi.use(mplCore.mplCore());
        const assetAddress = generateSigner(umi);

        return undefined;

        // const ownerSigner = createNoopSigner(publicKey(walletAddress));
        // umi.use(signerIdentity(ownerSigner));

        // const claimfundWallet = this.getMainWallet(umi);

        // let transactionBuilder = await this.createUmiTransactionBuilder(umi);

        // transactionBuilder = transactionBuilder.add(
        //     mplCore.createV1(umi, {
        //         name: 'Test Asset',
        //         uri: 'https://s.dangervalley.com/ducks/metadata/1.json',
        //         asset: assetAddress,
        //         collection: collectionAddress.publicKey,
        //         authority: claimfundWallet, // optional, defaults to payer
        //     })
        // );

        // // await addPlugin(umi, {
        // //     asset: asset.publicKey,
        // //     plugin: createPlugin('Freeze', { frozen: true }),
        // //     initAuthority: authority('Pubkey', { address: yourPubKey }),
        // //   }).sendAndConfirm(umi);

        // transactionBuilder = transactionBuilder.add(
        //     transferSol(umi, {
        //         source: ownerSigner,
        //         destination: claimfundWallet.publicKey,
        //         amount: sol(0.01),
        //     })
        // );

        // const blockhash = await web3Conn.getLatestBlockhash();
        // transactionBuilder = transactionBuilder.setFeePayer(ownerSigner);
        // transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        // const transaction = transactionBuilder.build(umi);
        // const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);

        // return {tx: web3jsTransaction, blockhash: blockhash};
    }

    static getMainWallet(umi: Umi): KeypairSigner {
        const privateKey = this.getMainWalletKeypair();

        const keypair = {
            publicKey: fromWeb3JsPublicKey(privateKey.publicKey), 
            secretKey: privateKey.secretKey,
        };
        const keypairSigner = createSignerFromKeypair(umi, keypair);
        return keypairSigner;
    }

    static getMainWalletKeypair(): web3.Keypair {
        const privateKey = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.MAIN_WALLET_PRIVATE_KEY!)));
        return privateKey;
    }
    
    static async createCampaignNFT(
        web3Conn: web3.Connection,
        campaign: InstanceType<typeof Campaign>,
        creator: InstanceType<typeof HighTable>
    ): Promise<{assetAddress: string, tokenMintAddress: string}> {
        console.log('----- createCampaignNFT -----');
    
        const umi = createUmi(process.env.SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());
        const creatorSigner = createSignerFromKeypair(umi, {
            publicKey: publicKey(creator.walletAddress),
            secretKey: new Uint8Array(creator.privateKey),
        });
        umi.use(signerIdentity(creatorSigner));
    
        // Create NFT for the campaign
        const nftMint = web3.Keypair.generate();
        const metadata = {
            name: campaign.title,
            symbol: 'BONO',
            uri: campaign.metadataUri,
        };
    
        let transactionBuilder = await this.createUmiTransactionBuilder(umi);
        transactionBuilder = transactionBuilder.add(
            mplTokenMetadata.createV1(umi, {
                mint: fromWeb3JsPublicKey(nftMint.publicKey),
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                sellerFeeBasisPoints: { basisPoints: 0, units: "%" },
                isCollection: false,
            })
        );
    
        // Create token for speculation
        const tokenMint = web3.Keypair.generate();
        transactionBuilder = transactionBuilder.add(
            spl.createInitializeMintInstruction(
                tokenMint.publicKey,
                9, // decimals
                new web3.PublicKey(creator.walletAddress),
                new web3.PublicKey(creator.walletAddress)
            )
        );
    
        const blockhash = await web3Conn.getLatestBlockhash();
        transactionBuilder = transactionBuilder.setFeePayer(creatorSigner);
        transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        const transaction = transactionBuilder.build(umi);
        const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);
    
        web3jsTransaction.partialSign(nftMint, tokenMint);
    
        const signature = await this.partialSignAndSend(web3Conn, web3jsTransaction);
        if (!signature) {
            throw new Error('Failed to create campaign NFT and token');
        }
    
        return {
            assetAddress: nftMint.publicKey.toBase58(),
            tokenMintAddress: tokenMint.publicKey.toBase58(),
        };
    }

    static async contributeToCampaign(
        web3Conn: web3.Connection,
        campaignWalletAddress: string,
        contributorAddress: string,
        tokenMintAddress: string,
        amount: number
    ): Promise<string> {
        const umi = createUmi(process.env.SOLANA_RPC!);
        const contributorSigner = createSignerFromKeypair(umi, {
            publicKey: publicKey(contributorAddress),
            secretKey: new Uint8Array(), // This should be filled with the actual private key in a secure manner
        });
        umi.use(signerIdentity(contributorSigner));
    
        let transactionBuilder = await this.createUmiTransactionBuilder(umi);
    
        // Transfer SOL to the campaign wallet
        transactionBuilder = transactionBuilder.add(
            transferSol(umi, {
                source: contributorSigner,
                destination: publicKey(campaignWalletAddress),
                amount: sol(amount),
            })
        );
    
        // Mint speculation tokens to the contributor
        const tokenMintPubkey = new web3.PublicKey(tokenMintAddress);
        const contributorTokenAccount = await spl.getAssociatedTokenAddress(
            tokenMintPubkey,
            new web3.PublicKey(contributorAddress)
        );
    
        transactionBuilder = transactionBuilder.add(
            spl.createMintToInstruction(
                tokenMintPubkey,
                contributorTokenAccount,
                new web3.PublicKey(campaignWalletAddress),
                amount * 1e9 // Assuming 9 decimals
            )
        );
    
        const blockhash = await web3Conn.getLatestBlockhash();
        transactionBuilder = transactionBuilder.setFeePayer(contributorSigner);
        transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        const transaction = transactionBuilder.build(umi);
        const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);
    
        const signature = await this.partialSignAndSend(web3Conn, web3jsTransaction);
        if (!signature) {
            throw new Error('Failed to contribute to campaign');
        }
    
        return signature;
    }

    static async redeemCampaignTokens(
        web3Conn: web3.Connection,
        campaignWalletAddress: string,
        redeemerAddress: string,
        tokenMintAddress: string,
        amount: number
    ): Promise<string> {
        const umi = createUmi(process.env.SOLANA_RPC!);
        const redeemerSigner = createSignerFromKeypair(umi, {
            publicKey: publicKey(redeemerAddress),
            secretKey: new Uint8Array(), // This should be filled with the actual private key in a secure manner
        });
        umi.use(signerIdentity(redeemerSigner));
    
        let transactionBuilder = await this.createUmiTransactionBuilder(umi);
    
        // Burn speculation tokens
        const tokenMintPubkey = new web3.PublicKey(tokenMintAddress);
        const redeemerTokenAccount = await spl.getAssociatedTokenAddress(
            tokenMintPubkey,
            new web3.PublicKey(redeemerAddress)
        );
    
        transactionBuilder = transactionBuilder.add(
            spl.createBurnInstruction(
                tokenMintPubkey,
                redeemerTokenAccount,
                new web3.PublicKey(redeemerAddress),
                amount * 1e9 // Assuming 9 decimals
            )
        );
    
        // Transfer SOL from campaign wallet to redeemer
        transactionBuilder = transactionBuilder.add(
            transferSol(umi, {
                source: createSignerFromKeypair(umi, {
                    publicKey: publicKey(campaignWalletAddress),
                    secretKey: new Uint8Array(), // This should be the campaign wallet's private key
                }),
                destination: publicKey(redeemerAddress),
                amount: sol(amount),
            })
        );
    
        const blockhash = await web3Conn.getLatestBlockhash();
        transactionBuilder = transactionBuilder.setFeePayer(redeemerSigner);
        transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        const transaction = transactionBuilder.build(umi);
        const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);
    
        const signature = await this.partialSignAndSend(web3Conn, web3jsTransaction);
        if (!signature) {
            throw new Error('Failed to redeem campaign tokens');
        }
    
        return signature;
    }

    static async createToken(
        connection: web3.Connection,
        payer: web3.Keypair,
        name: string,
        symbol: string,
        decimals: number,
        ownerAddress: string
    ): Promise<web3.PublicKey> {
        const mintAccount = await spl.createMint(
            connection,
            payer,
            payer.publicKey,
            payer.publicKey,
            decimals
        );

        // Create associated token account for the owner
        const ownerPublicKey = new web3.PublicKey(ownerAddress);
        const associatedTokenAccount = await spl.getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintAccount,
            ownerPublicKey
        );

        return mintAccount;
    }

    static async contributeToCase(
        connection: web3.Connection,
        fromPublicKey: web3.PublicKey,
        toPublicKey: web3.PublicKey,
        tokenMintPublicKey: web3.PublicKey,
        amount: number
    ): Promise<web3.Transaction> {
        const fromTokenAccount = await spl.getAssociatedTokenAddress(tokenMintPublicKey, fromPublicKey);
        const toTokenAccount = await spl.getAssociatedTokenAddress(tokenMintPublicKey, toPublicKey);

        const transaction = new web3.Transaction().add(
            spl.createTransferInstruction(
                fromTokenAccount,
                toTokenAccount,
                fromPublicKey,
                amount
            )
        );

        return transaction;
    }

    static async redeemCaseTokens(
        connection: web3.Connection,
        redeemerPublicKey: web3.PublicKey,
        campaignPublicKey: web3.PublicKey,
        tokenMintPublicKey: web3.PublicKey,
        amount: number
    ): Promise<web3.Transaction> {
        const redeemerTokenAccount = await spl.getAssociatedTokenAddress(tokenMintPublicKey, redeemerPublicKey);
        const campaignTokenAccount = await spl.getAssociatedTokenAddress(tokenMintPublicKey, campaignPublicKey);

        const transaction = new web3.Transaction().add(
            spl.createBurnInstruction(
                redeemerTokenAccount,
                tokenMintPublicKey,
                redeemerPublicKey,
                amount
            )
        );

        return transaction;
    }
}
