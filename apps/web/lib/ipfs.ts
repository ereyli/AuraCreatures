import axios from "axios";
import { env, isMockMode } from "../env.mjs";

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface Web3StorageResponse {
  cid: string;
}

/**
 * Pin image to Pinata IPFS
 * Pinata is now required - no fallback to Web3.Storage
 */
export async function pinToIPFS(file: Buffer, filename: string): Promise<string> {
  if (!env.PINATA_JWT) {
    throw new Error("PINATA_JWT is required. Please configure Pinata API key in environment variables.");
  }
  
  const formData = new FormData();
  // @ts-ignore - Buffer to Blob conversion works at runtime
  const blob = new Blob([file], { type: "image/png" });
  formData.append("file", blob, filename);
  
  try {
    const response = await axios.post<PinataResponse>(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          Authorization: `Bearer ${env.PINATA_JWT}`,
        },
      }
    );
    
    const ipfsHash = response.data.IpfsHash;
    console.log(`✅ Image pinned to Pinata: ipfs://${ipfsHash}`);
    return `ipfs://${ipfsHash}`;
  } catch (error: any) {
    console.error("❌ Pinata upload error:", error.response?.data || error.message);
    throw new Error(`Failed to upload image to Pinata: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Pin JSON metadata to Pinata IPFS
 * Pinata is now required - no fallback to Web3.Storage
 */
export async function pinJSONToIPFS(json: object): Promise<string> {
  if (!env.PINATA_JWT) {
    throw new Error("PINATA_JWT is required. Please configure Pinata API key in environment variables.");
  }
  
  try {
    const response = await axios.post<PinataResponse>(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      json,
      {
        headers: {
          Authorization: `Bearer ${env.PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const ipfsHash = response.data.IpfsHash;
    console.log(`✅ Metadata pinned to Pinata: ipfs://${ipfsHash}`);
    return `ipfs://${ipfsHash}`;
  } catch (error: any) {
    console.error("❌ Pinata metadata upload error:", error.response?.data || error.message);
    throw new Error(`Failed to upload metadata to Pinata: ${error.response?.data?.error || error.message}`);
  }
}

