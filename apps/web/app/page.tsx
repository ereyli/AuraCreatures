"use client";

import { useState, useEffect, Suspense } from "react";
import { ethers } from "ethers";
import type { GenerateResponse, MintPermitResponse } from "@/lib/types";
import { generationMessages, getGenerationMessage } from "@/lib/generation-messages";

// Farcaster Mini App SDK - will be loaded dynamically
let sdk: any = null;

type Step = "wallet" | "story" | "generating" | "generated" | "minting" | "minted";

function HomePageContent() {
  const [step, setStep] = useState<Step>("wallet");
  const [generated, setGenerated] = useState<GenerateResponse | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isFarcaster, setIsFarcaster] = useState(false);

  // Initialize Farcaster SDK if available
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Try to load Farcaster SDK dynamically
        const farcasterModule = await import("@farcaster/miniapp-sdk");
        sdk = farcasterModule.sdk;
        
        // Check if we're in a Farcaster client
        const context = await sdk.context();
        if (context.client) {
          setIsFarcaster(true);
          // Call ready() to hide splash screen
          await sdk.actions.ready();
          console.log("✅ Farcaster Mini App initialized");
        }
      } catch (e) {
        // SDK not available (running on web, not in Farcaster)
        console.log("Farcaster SDK not available, running in web mode");
      }
    };
    initFarcaster();
  }, []);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      // Try Farcaster wallet first (if SDK is available)
      try {
        const farcasterModule = await import("@farcaster/miniapp-sdk");
        sdk = farcasterModule.sdk;
        const context = await sdk.context();
        if (context.client?.walletAddress) {
          setWallet(context.client.walletAddress);
          setStep("story");
          return;
        }
      } catch (e) {
        // Farcaster not available, continue to standard wallet check
      }

      // Check for standard web3 wallet
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const address = await accounts[0].getAddress();
            setWallet(address);
            setStep("story");
          }
        } catch (error) {
          console.log("No wallet connected");
        }
      }
    };
    checkWallet();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try Farcaster wallet first if available
      if (isFarcaster) {
        try {
          const farcasterModule = await import("@farcaster/miniapp-sdk");
          sdk = farcasterModule.sdk;
          const wallet = await sdk.actions.connectEthereumWallet();
          if (wallet.address) {
            setWallet(wallet.address);
            setStep("story");
            return;
          }
        } catch (e) {
          console.log("Farcaster wallet connection failed, trying standard wallet");
        }
      }

      // Fallback to standard web3 wallet
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWallet(address);
        setStep("story");
      } else {
        setError("Please install MetaMask or connect via Farcaster");
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      if (err instanceof Error) {
        if (err.message.includes("User rejected")) {
          setError("Wallet connection was cancelled");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to connect wallet");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateNFT = async () => {
    if (!wallet) {
      setError("Wallet not connected");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStep("generating");
      setGenerationProgress(0);
      setCurrentMessage(generationMessages[0]);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const newProgress = Math.min(prev + 2, 95);
          const message = getGenerationMessage(newProgress);
          setCurrentMessage(message);
          return newProgress;
        });
      }, 500);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setCurrentMessage(generationMessages[generationMessages.length - 1]);

      if (!response.ok) {
        if (response.status === 402) {
          try {
            const paymentData = await response.json();
            const errorMessage = paymentData.message || paymentData.error || "Payment required for image generation";
            setError(`${errorMessage}\n\nImage generation requires payment via x402 protocol.`);
            setStep("story");
            return;
          } catch {
            setError("Payment required for image generation.");
            setStep("story");
            return;
          }
        }

        let errorMessage = "Generation failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: GenerateResponse = await response.json();
      setGenerated(data);
      setStep("generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStep("story");
    } finally {
      setLoading(false);
    }
  };

  const requestMintPermit = async () => {
    if (!wallet) return;

    try {
      setLoading(true);
      setError(null);
      setStep("minting");

      // First request - should return 402
      const response = await fetch("/api/mint-permit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
        }),
      });

      if (response.status === 200) {
        // Direct permit (mock mode - no x402 payment)
        const permitData: MintPermitResponse = await response.json();
        await mintNFT(permitData);
      } else if (response.status === 402) {
        const paymentRequest = await response.json();

        // Handle x402 payment
        if (isFarcaster) {
          // Use Farcaster wallet for payment
          try {
            // TODO: Implement Farcaster payment flow
            alert(`Please pay ${paymentRequest.accepts[0].amount} ${paymentRequest.accepts[0].asset} to ${paymentRequest.accepts[0].recipient}`);
          } catch (e) {
            setError("Payment failed. Please try again.");
            setStep("generated");
            return;
          }
        } else {
          // Standard web3 payment flow
          alert(`Please pay ${paymentRequest.accepts[0].amount} ${paymentRequest.accepts[0].asset} to ${paymentRequest.accepts[0].recipient}`);
        }

        // After payment, retry with X-PAYMENT header
        // TODO: Implement actual x402 payment flow
        const paymentHeader = JSON.stringify({
          paymentId: "mock-payment-id",
          amount: paymentRequest.accepts[0].amount,
          asset: paymentRequest.accepts[0].asset,
          network: paymentRequest.accepts[0].network,
          payer: wallet,
          recipient: paymentRequest.accepts[0].recipient,
        });

        const mintResponse = await fetch("/api/mint-permit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-PAYMENT": paymentHeader,
          },
          body: JSON.stringify({
            wallet,
          }),
        });

        if (!mintResponse.ok) {
          const errorData = await mintResponse.json();
          throw new Error(`Mint permit failed: ${errorData.error || "Unknown error"}`);
        }

        const permitData: MintPermitResponse = await mintResponse.json();
        await mintNFT(permitData);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(`Unexpected response: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mint permit failed");
      setStep("generated");
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async (permit: MintPermitResponse) => {
    if (!wallet || typeof window.ethereum === "undefined") return;

    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Contract ABI
      const contractABI = [
        "function mintWithSig((address to, address payer, uint256 xUserId, string tokenURI, uint256 nonce, uint256 deadline) auth, bytes signature) external",
      ];

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
        contractABI,
        signer
      );

      // Convert walletAddress to uint256 for contract
      const walletHash = ethers.id(permit.auth.walletAddress);
      const walletHashBigInt = BigInt(walletHash);

      const authForContract = {
        to: permit.auth.to,
        payer: permit.auth.payer,
        xUserId: walletHashBigInt.toString(),
        tokenURI: permit.auth.tokenURI,
        nonce: permit.auth.nonce,
        deadline: permit.auth.deadline,
      };

      const tx = await contract.mintWithSig(authForContract, permit.signature);
      await tx.wait();

      setStep("minted");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Minting failed");
      setStep("generated");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 md:mb-8">Aura Creatures</h1>
        <p className="text-lg md:text-xl text-center mb-8 md:mb-12 text-gray-300 px-4">
          {isFarcaster ? "Create your unique AI creature on Base" : "Connect your wallet, discover your story, and mint your unique AI creature on Base"}
        </p>

        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-500/90 text-white p-4 rounded-lg mb-6 animate-pulse">
              {error}
            </div>
          )}

          {/* Wallet Connection Step */}
          {step === "wallet" && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Step 1: Connect Wallet</h2>
              <p className="mb-6 text-gray-300">Connect your wallet to begin your journey</p>

              {wallet && (
                <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-sm">
                  ✅ Wallet Connected: {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                </div>
              )}

              <button
                onClick={connectWallet}
                disabled={loading || !!wallet}
                className={`${
                  wallet
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white font-bold py-3 px-6 rounded-lg w-full transition-colors`}
              >
                {loading ? "Connecting..." : wallet ? "✅ Wallet Connected" : "Connect Wallet"}
              </button>

              {wallet && (
                <button
                  onClick={() => setStep("story")}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
                >
                  Continue to Story →
                </button>
              )}
            </div>
          )}

          {/* Story Step */}
          {step === "story" && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Your Aura Creature Story</h2>

              <div className="space-y-4 mb-6 text-gray-200">
                <p className="text-lg">
                  🌟 <strong>In a realm where digital magic meets blockchain...</strong>
                </p>
                <p>
                  Every wallet holds a unique essence, a signature that defines who you are in this vast
                  digital universe. Your Aura Creature is waiting to be born, shaped by the very essence
                  of your wallet address.
                </p>
                <p>
                  🎨 Our AI will analyze your unique wallet signature and create a one-of-a-kind creature
                  just for you. Each trait—color, expression, outfit, and more—is determined by your
                  wallet's unique identity.
                </p>
                <p>
                  ✨ Once created, your creature becomes a permanent NFT on Base, a testament to your
                  journey in the Web3 world.
                </p>
              </div>

              {wallet && (
                <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm">
                  <p><strong>Wallet:</strong> {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}</p>
                </div>
              )}

              <button
                onClick={generateNFT}
                disabled={loading || !wallet}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg w-full text-lg transition-all transform hover:scale-105"
              >
                {loading ? "Creating..." : "✨ Create My Aura Creature ✨"}
              </button>
            </div>
          )}

          {/* Generating Step */}
          {step === "generating" && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Creating Your Creature...</h2>

              <div className="mb-6">
                <div className="text-6xl mb-4 animate-bounce">✨</div>
                <p className="text-xl font-semibold mb-4 text-purple-300">{currentMessage}</p>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">{generationProgress}%</p>
              </div>

              <div className="space-y-2 text-gray-300 text-sm">
                <p>🔄 The AI is working its magic...</p>
                <p>⏳ This may take 10-30 seconds</p>
              </div>
            </div>
          )}

          {/* Generated Step */}
          {step === "generated" && generated && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Your Aura Creature is Ready! 🎉</h2>

              <div className="mb-6">
                {generated.preview && (
                  <div className="mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generated.preview}
                      alt="Generated NFT"
                      className="w-full rounded-lg border-2 border-purple-500/50 shadow-lg"
                    />
                  </div>
                )}

                {!generated.preview && generated.imageUrl && (
                  <div className="mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generated.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                      alt="Generated NFT"
                      className="w-full rounded-lg border-2 border-purple-500/50 shadow-lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  {Object.entries(generated.traits).map(([key, value]) => (
                    <div key={key} className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="font-semibold capitalize text-purple-300">{key}</div>
                      <div className="text-gray-300">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={requestMintPermit}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg w-full text-lg transition-all transform hover:scale-105"
              >
                {loading ? "Processing..." : "🚀 Mint My NFT"}
              </button>
            </div>
          )}

          {/* Minting Step */}
          {step === "minting" && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Minting Your NFT...</h2>
              <div className="text-6xl mb-4 animate-spin">⚡</div>
              <p className="text-gray-300">Your creature is being minted on Base blockchain</p>
            </div>
          )}

          {/* Minted Step */}
          {step === "minted" && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 md:p-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">🎉 Success! 🎉</h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-6">Your Aura Creature NFT has been minted!</p>
              <div className="text-6xl mb-4">✨</div>
              <p className="text-gray-400">Check your wallet to see your new NFT</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
