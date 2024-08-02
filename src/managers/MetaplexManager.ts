import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, sol, some } from "@metaplex-foundation/umi";
import * as mplCore from '@metaplex-foundation/mpl-core';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import { CreateTransactionResponse, SolanaManager } from "./SolanaManager";

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
        web3Conn: web3.Connection,
        campaign: any,
        creator: any
    ): Promise<CreateTransactionResponse & {assetAddress: string} | undefined> {
        console.log('createCampaignNFT', campaign, creator);

        const umi = createUmi(import.meta.env.VITE_APP_SOLANA_RPC!);
        umi.use(mplTokenMetadata.mplTokenMetadata());
        
        const creatorSigner = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(creator.privateKey));
        umi.use(mplCore.keypairIdentity(creatorSigner));

        const nftMint = umi.eddsa.generateKeypair();

        const metadata = {
            name: campaign.title,
            symbol: 'BONO',
            uri: campaign.metadataUri,
        };

        let transactionBuilder = await SolanaManager.createUmiTransactionBuilder(umi);

        transactionBuilder = transactionBuilder.add(
            mplTokenMetadata.createV1(umi, {
                mint: nftMint.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                sellerFeeBasisPoints: 0,
                collection: some(publicKey(process.env.CAMPAIGN_COLLECTION_ADDRESS!)),
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