import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, some, percentAmount } from "@metaplex-foundation/umi";
import * as mplCore from '@metaplex-foundation/mpl-core';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import { SolanaManager } from "./SolanaManager";
import { Connection, PublicKey } from '@solana/web3.js';

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
    ): Promise<{ tx: any; blockhash: any; assetAddress: string } | undefined> {
        console.log('createCampaignNFT', campaign, creator);

        const umi = createUmi(import.meta.env.VITE_APP_SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());
        
        const creatorSigner = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(creator.privateKey));
        umi.use(mplCore.createSignerFromKeypair(umi, creatorSigner));

        const nftMint = umi.eddsa.generateKeypair();

        const metadata = {
            name: campaign.title,
            symbol: 'BONO',
            uri: campaign.metadataUri,
        };

        let transactionBuilder = umi.transactionBuilder();

        transactionBuilder = transactionBuilder.add(
            mplTokenMetadata.createV1(umi, {
                mint: nftMint.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                sellerFeeBasisPoints: percentAmount(0),
                collection: some({
                    key: publicKey(process.env.CAMPAIGN_COLLECTION_ADDRESS!),
                    verified: false
                }),
            })
        );

        const blockhash = await web3Conn.getLatestBlockhash();
        transactionBuilder = transactionBuilder.setFeePayer(creatorSigner.publicKey);
        transactionBuilder = transactionBuilder.setBlockhash(blockhash.blockhash);
        const transaction = transactionBuilder.build(umi);

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