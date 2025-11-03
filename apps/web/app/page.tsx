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
  const [messageIndex, setMessageIndex] = useState(0);

  // Initialize Farcaster SDK if available
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const farcasterModule = await import("@farcaster/miniapp-sdk");
        sdk = farcasterModule.sdk;
        const context = await sdk.context();
        if (context.client) {
          setIsFarcaster(true);
          await sdk.actions.ready();
          console.log("Farcaster Mini App initialized");
        }
      } catch (e) {
        console.log("Farcaster SDK not available, running in web mode");
      }
    };
    initFarcaster();
  }, []);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
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
        // Farcaster not available, continue
      }

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

  // Animate story messages during generation
  useEffect(() => {
    if (step === "generating" && generationProgress < 100) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          const newIndex = Math.min(prev + 1, generationMessages.length - 1);
          setCurrentMessage(generationMessages[newIndex]);
          return newIndex;
        });
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [step, generationProgress]);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

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
      setMessageIndex(0);
      setCurrentMessage(generationMessages[0]);

      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const newProgress = Math.min(prev + 1.5, 95);
          return newProgress;
        });
      }, 200);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setMessageIndex(generationMessages.length - 1);
      setCurrentMessage(generationMessages[generationMessages.length - 1]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!response.ok) {
        if (response.status === 402) {
          try {
            const paymentData = await response.json();
            const errorMessage = paymentData.message || paymentData.error || "Payment required";
            setError(errorMessage);
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
          errorMessage = `Server error: ${response.status}`;
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

      const response = await fetch("/api/mint-permit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
        }),
      });

      if (response.status === 200) {
        const permitData: MintPermitResponse = await response.json();
        await mintNFT(permitData);
      } else if (response.status === 402) {
        const paymentRequest = await response.json();
        alert(`Please pay ${paymentRequest.accepts[0].amount} ${paymentRequest.accepts[0].asset} to ${paymentRequest.accepts[0].recipient}`);

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

      const contractABI = [
        "function mintWithSig((address to, address payer, uint256 xUserId, string tokenURI, uint256 nonce, uint256 deadline) auth, bytes signature) external",
      ];

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
        contractABI,
        signer
      );

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Aura Creatures
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-medium">
            Where Your Wallet Becomes Legendary
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="bg-red-500/90 text-white p-4 rounded-lg mb-6 border border-red-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Error:</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Wallet Connection Step */}
          {step === "wallet" && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Step 1: Connect Your Wallet
              </h2>
              <p className="mb-8 text-gray-300 text-lg">
                Unlock the gateway to your digital destiny
              </p>

              {wallet && (
                <div className="mb-6 bg-green-500/20 border border-green-400 rounded-lg p-4 text-sm">
                  <p className="text-white font-medium">
                    Connected: {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                  </p>
                </div>
              )}

              <button
                onClick={connectWallet}
                disabled={loading || !!wallet}
                className={`${
                  wallet
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                } text-white font-semibold py-4 px-8 rounded-lg w-full text-lg transition-colors shadow-lg`}
              >
                {loading ? "Connecting..." : wallet ? "Wallet Connected" : "Connect Wallet"}
              </button>

              {wallet && (
                <button
                  onClick={() => setStep("story")}
                  className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-lg w-full text-lg transition-colors shadow-lg"
                >
                  Continue to Story
                </button>
              )}
            </div>
          )}

          {/* Story Step */}
          {step === "story" && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
                The Legend of Aura Creatures
              </h2>

              <div className="space-y-6 mb-8 text-gray-200 text-lg leading-relaxed">
                <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
                  <p className="font-semibold text-xl mb-2 text-white">In a realm where digital magic meets blockchain</p>
                  <p>
                    Every wallet holds a unique essence, a signature that defines who you are in this vast digital
                    universe. Your Aura Creature is waiting to be born, shaped by the very essence of your wallet
                    address.
                  </p>
                </div>

                <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                  <p className="font-semibold text-xl mb-2 text-white">The AI Magic</p>
                  <p>
                    Our AI will analyze your unique wallet signature and create a one-of-a-kind creature just for you.
                    Each trait—color, expression, outfit, and more—is determined by your wallet&apos;s unique identity.
                    No two creatures are ever the same.
                  </p>
                </div>

                <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
                  <p className="font-semibold text-xl mb-2 text-white">Eternal on Base</p>
                  <p>
                    Once created, your creature becomes a permanent NFT on Base blockchain, a testament to your journey
                    in the Web3 world. Own a piece of digital history that&apos;s uniquely yours.
                  </p>
                </div>
              </div>

              {wallet && (
                <div className="mb-6 p-4 bg-purple-500/20 border border-purple-400 rounded-lg text-sm">
                  <p className="text-white font-medium">
                    Wallet: {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                  </p>
                </div>
              )}

              <button
                onClick={generateNFT}
                disabled={loading || !wallet}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-5 px-8 rounded-lg w-full text-xl transition-colors shadow-xl"
              >
                {loading ? "Creating..." : "Create My Aura Creature"}
              </button>
            </div>
          )}

          {/* Generating Step */}
          {step === "generating" && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
                Creating Your Legend
              </h2>

              <div className="mb-8">
                <div className="bg-black/30 rounded-xl p-8 mb-6 border border-white/10">
                  <p className="text-xl md:text-2xl font-medium mb-6 text-gray-200 min-h-[80px] flex items-center justify-center">
                    {currentMessage}
                  </p>
                  <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${generationProgress}%` }}
                    >
                      <span className="text-white text-xs font-medium">{Math.round(generationProgress)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-gray-400 text-sm">
                <p>The AI is working its magic...</p>
                <p>This may take 15-30 seconds</p>
              </div>
            </div>
          )}

          {/* Generated Step */}
          {step === "generated" && generated && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
                Your Aura Creature is Ready
              </h2>

              <div className="mb-8">
                {generated.preview && (
                  <div className="mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generated.preview}
                      alt="Generated NFT"
                      className="w-full rounded-xl border-2 border-white/30 shadow-2xl"
                    />
                  </div>
                )}

                {!generated.preview && generated.imageUrl && (
                  <div className="mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generated.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                      alt="Generated NFT"
                      className="w-full rounded-xl border-2 border-white/30 shadow-2xl"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(generated.traits).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-purple-500/10 backdrop-blur-sm p-4 rounded-lg border border-purple-500/20"
                    >
                      <div className="font-semibold capitalize text-purple-300 text-sm mb-1">{key}</div>
                      <div className="text-white font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={requestMintPermit}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-5 px-8 rounded-lg w-full text-xl transition-colors shadow-xl"
              >
                {loading ? "Processing..." : "Mint My NFT on Base"}
              </button>
            </div>
          )}

          {/* Minting Step */}
          {step === "minting" && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
                Minting Your NFT
              </h2>
              <div className="text-6xl mb-6">⏳</div>
              <p className="text-white text-xl font-medium">Your creature is being minted on Base blockchain</p>
              <p className="text-gray-400 mt-4">This will take just a moment...</p>
            </div>
          )}

          {/* Minted Step */}
          {step === "minted" && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Success
              </h2>
              <p className="text-2xl md:text-3xl text-white font-semibold mb-6">
                Your Aura Creature NFT has been minted
              </p>
              <p className="text-gray-300 text-lg font-medium">Check your wallet to see your new NFT</p>
              <div className="mt-8 space-y-2">
                <p className="text-white font-semibold text-xl">Welcome to the Aura Creatures family</p>
                <p className="text-gray-400">Share your creation with the world</p>
              </div>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-2xl font-semibold">Loading...</div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
