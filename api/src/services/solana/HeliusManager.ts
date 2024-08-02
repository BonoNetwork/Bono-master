import { Keypair } from '@solana/web3.js';
import { Helius, MintApiRequest } from "helius-sdk";
import { HeliusAsset, MintApiResult } from './HeliusTypes';
import { Asset, AssetType } from '../../models/types';

export class HeliusManager {

    static apiUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
    static helius: Helius;

    static async initHelius(){
        if (!this.helius){
            this.helius = new Helius(process.env.HELIUS_API_KEY!);
        }
    }

    static async mintCompressedNFT(params: MintApiRequest): Promise<MintApiResult> {
        this.initHelius();

        const response = await this.helius.mintCompressedNft(params);
        return response.result;
    }

    static async delegateCollectionAuthority(collectionMintAddress: string, keypair: Keypair, newCollectionAuthority: string){
        this.initHelius();

        const res = await this.helius.delegateCollectionAuthority({
            collectionMint: collectionMintAddress,
            newCollectionAuthority: newCollectionAuthority,
            updateAuthorityKeypair: keypair,
            payerKeypair: keypair,
        });
        console.log('delegateCollectionAuthority res', res);
    }

    static async revokeCollectionAuthority(collectionMintAddress: string, keypair: Keypair, delegatedCollectionAuthority: string){
        this.initHelius();

        const res = await this.helius.revokeCollectionAuthority({
            collectionMint: collectionMintAddress,
            delegatedCollectionAuthority: delegatedCollectionAuthority,
            revokeAuthorityKeypair: keypair,
            payerKeypair: keypair,
        });
        console.log('revokeCollectionAuthority res', res);
    }

    static async getAssetsByOwner(walletAddress: string): Promise<HeliusAsset[]> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAssetsByOwner',
                params: {
                    ownerAddress: walletAddress,
                    page: 1, // Starts at 1
                    limit: 1000,
                },
            }),
        });
        const { result } = await response.json();
        return result.items;
    }

    static async getAssetBatch(mintTokens: string[]): Promise<HeliusAsset[]> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAssetBatch',
                params: {
                    ids: mintTokens
                },
            }),
        });
        const { result } = await response.json();
        return result;
    };

    static async getAsset(mintToken: string): Promise<HeliusAsset> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAsset',
                params: {
                    id: mintToken,
                    displayOptions: {​
                        showUnverifiedCollections: true,​
                        showCollectionMetadata: false,​
                        showFungible: false,​
                        showInscription: false​
                    }
                },
            }),
        });
        const { result } = await response.json();
        return result;
    };

    static parseAssets(assets: HeliusAsset[]): Asset[] {
        const parsedAssets: Asset[] = [];

        for (const asset of assets){
            const parsedAsset = this.parseAsset(asset);
            if (parsedAsset) {
                parsedAssets.push(parsedAsset);
            }
        }

        return parsedAssets;
    }

    static parseAsset(asset: HeliusAsset): Asset | undefined {
        const imagesMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        console.log('asset', JSON.stringify(asset));

        if (asset.burnt) { return undefined; }

        let assetType = AssetType.UNKNOWN;
        if (asset.interface == 'ProgrammableNFT'){
            assetType = AssetType.pNFT;
        }
        else if (asset.compression.compressed){
            assetType = AssetType.cNFT;
        }
        else if (asset.interface == 'Custom'){
            assetType = AssetType.NFT;
        }
        else if (asset.interface == 'V1_NFT'){
            assetType = AssetType.NFT;
        }
        else {
            return undefined;
        }

        const collection = asset.grouping.find(g => g.group_key == 'collection');

        const parsedAsset: Asset = {
            id: asset.id,
            type: assetType,
            title: asset.content.metadata.name.trim(),
            image: asset.content.files.find(f => imagesMimeTypes.includes(f.mime))?.uri,
            isLocked: this.isAssetLocked(asset),
            collection: collection?.group_value ? { id: collection?.group_value } : undefined,
        };

        return parsedAsset;
    }

    static isAssetLocked(asset: HeliusAsset): boolean {
        if (asset.interface == 'ProgrammableNFT'){
            return asset.ownership.delegated;
        }
        else {
            return asset.ownership.frozen;
        }
    }

    static recentPrioritizationFees: { fee: number, date: Date } | undefined;
    static async getRecentPrioritizationFees(forceCleanCache = false): Promise<number> {
        if (!forceCleanCache && this.recentPrioritizationFees && (new Date().getTime() - this.recentPrioritizationFees.date.getTime()) < 60 * 1000){
            return this.recentPrioritizationFees.fee;
        }

        let fees = 1;

        try{

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getPriorityFeeEstimate",
                    params: [{
                        "accountKeys": ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],
                        "options": {
                            "includeAllPriorityFeeLevels": true,
                        }
                    }]
                }),
            });

            const { result } = await response.json();

            if (result?.priorityFeeLevels?.high){
                fees = result.priorityFeeLevels.high;

                console.log('getRecentPrioritizationFees', 'fees', fees);
                const maxMicroLamports = 100000 * 1000000
                console.log('getRecentPrioritizationFees', 'maxMicroLamports', maxMicroLamports);
                if (fees >= maxMicroLamports){
                    fees = maxMicroLamports;
                }

                fees = Math.ceil(fees);
                console.log('getRecentPrioritizationFees', 'fees', fees, '!!!');

                this.recentPrioritizationFees = { fee: fees, date: new Date() };
            }
        }
        catch(e){
            console.error('getRecentPrioritizationFees', e);
        }

        return fees;
    };


}