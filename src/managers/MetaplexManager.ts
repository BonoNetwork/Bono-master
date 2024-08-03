import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, some, percentAmount, createSignerFromKeypair, type Signer } from "@metaplex-foundation/umi";
import * as mplCore from '@metaplex-foundation/mpl-core';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import { SolanaManager } from "./SolanaManager";
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

export class MetaplexManager {
    static async fetchAssetsByOwner(walletAddress: string) {
        console.log('fetchAssetsByOwner', walletAddress);
        
        const umi = createUmi(import.meta.env.VITE_APP_SOLANA_RPC!);
        umi.use(mplCore.mplCore());

        const owner = publicKey(walletAddress)

        const assetsByOwner = await mplCore.getAssetV1GpaBuilder(umi)
            .whereField('key', mplCore.Key.AssetV1)
            .whereField('owner', owner)
            .getDeserialized();

        return assetsByOwner;
    }

    static async createCampaignNFT(
        web3Conn: Connection,
        campaign: any,
        creator: any
    ): Promise<{ tx: Transaction; blockhash: any; assetAddress: string } | undefined> {
        console.log('createCampaignNFT', campaign, creator);

        const umi = createUmi(import.meta.env.VITE_APP_SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());
        
        const creatorSigner = createSignerFromKeypair(umi, {
            publicKey: publicKey(creator.publicKey),
            secretKey: new Uint8Array(creator.privateKey),
        });

        const nftMint = umi.eddsa.generateKeypair();

        const metadata = {
            name: campaign.title,
            symbol: 'BONO',
            uri: campaign.metadataUri,
        };

        const createNftInstruction = mplTokenMetadata.createV1(umi, {
            mint: nftMint.publicKey,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            sellerFeeBasisPoints: percentAmount(0),
            collection: some({
                key: publicKey(process.env.CAMPAIGN_COLLECTION_ADDRESS!),
                verified: false
            }),
        });

        const transaction = new Transaction();
        transaction.add(createNftInstruction as unknown as TransactionInstruction);

        const blockhash = await web3Conn.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash;
        transaction.feePayer = new PublicKey(creator.publicKey);

        return {
            tx: transaction,
            blockhash: blockhash,
            assetAddress: nftMint.publicKey.toString(),
        };
    }

    static async fetchCampaignNFT(campaignAddress: string) {
        const umi = createUmi(import.meta.env.VITE_APP_SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());

        const asset = await mplTokenMetadata.fetchDigitalAsset(umi, publicKey(campaignAddress));
        return asset;
    }
}