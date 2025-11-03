// Shared types for EIP-712 and traits

export interface MintAuth {
  to: string;
  payer: string;
  walletAddress: string; // Changed from xUserId to walletAddress
  tokenURI: string;
  nonce: number;
  deadline: number;
}

export interface Traits {
  color: string;
  eyes: string;
  ears: string;
  mouth: string;
  outfit: string;
  hand: string;
  bg: string;
  emotionTheme?: string; // Optional: overall vibe from bio
  hair?: string; // Optional: hair style / head detail
}

export interface GenerateRequest {
  walletAddress: string; // Wallet address instead of x_user_id
}

export interface GenerateResponse {
  seed: string;
  traits: Traits;
  imageUrl: string;
  metadataUrl: string;
  preview?: string; // Base64 encoded image for immediate preview
}

export interface MintPermitRequest {
  wallet: string;
}

export interface MintPermitResponse {
  auth: MintAuth;
  signature: string;
}

