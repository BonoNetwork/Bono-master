import { create, IPFSHTTPClient } from 'ipfs-http-client';
import axios from 'axios';
import { Buffer } from 'buffer';

export class StorageManager {
    private static ipfs: IPFSHTTPClient;

    private static getIPFSClient(): IPFSHTTPClient {
        if (!this.ipfs) {
            // Connect to a public IPFS node. You can replace this with your own node if you have one.
            this.ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
        }
        return this.ipfs;
    }

    static async uploadFile(buffer: Buffer, filename: string): Promise<string> {
        try {
            const ipfs = this.getIPFSClient();
            const result = await ipfs.add({ path: filename, content: buffer });
            
            // The CID (Content Identifier) is the IPFS hash of the file
            return result.cid.toString();
        } catch (err) {
            console.error('StorageManager', 'uploadFile', err);
            throw new Error('Failed to upload file to IPFS');
        }
    }

    static async uploadCampaignImage(campaignId: string, buffer: Buffer, filename: string): Promise<string> {
        const cid = await this.uploadFile(buffer, `campaigns/${campaignId}/images/${filename}`);
        return `https://ipfs.io/ipfs/${cid}`;
    }

    static async uploadCampaignDocument(campaignId: string, buffer: Buffer, filename: string): Promise<string> {
        const cid = await this.uploadFile(buffer, `campaigns/${campaignId}/documents/${filename}`);
        return cid; // Return only the CID for documents, as they might be sensitive
    }

    static async downloadFile(cid: string): Promise<Buffer> {
        try {
            const ipfs = this.getIPFSClient();
            const chunks = [];
            for await (const chunk of ipfs.cat(cid)) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        } catch (err) {
            console.error('StorageManager', 'downloadFile', err);
            throw new Error('Failed to download file from IPFS');
        }
    }

    static getPublicUrl(cid: string): string {
        return `https://ipfs.io/ipfs/${cid}`;
    }

    // Note: IPFS doesn't support file deletion. Files will eventually be garbage collected if not pinned.
    static async pinFile(cid: string): Promise<void> {
        try {
            const ipfs = this.getIPFSClient();
            await ipfs.pin.add(cid);
        } catch (err) {
            console.error('StorageManager', 'pinFile', err);
            throw new Error('Failed to pin file on IPFS');
        }
    }
}