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
          console.log("✅ Farcaster Mini App initialized");
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
      }, 2000); // Change message every 2 seconds

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

      // Simulate progress with story messages
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

      // Wait a bit for the final message to show
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 via-blue-500 to-cyan-400 animate-gradient bg-[length:400%_400%] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 animate-pulse">
            AURA CREATURES
          </h1>
          <p className="text-xl md:text-2xl font-bold text-white/90 drop-shadow-lg">
            Where Your Wallet Becomes Legendary ✨
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="text-2xl animate-bounce">🎨</span>
            <span className="text-2xl animate-bounce animation-delay-200">🚀</span>
            <span className="text-2xl animate-bounce animation-delay-400">💎</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="bg-red-500/90 text-white p-4 rounded-2xl mb-6 animate-shake border-2 border-red-300 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <p className="font-bold">{error}</p>
              </div>
            </div>
          )}

          {/* Wallet Connection Step */}
          {step === "wallet" && (
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center border-2 border-white/30 shadow-2xl transform hover:scale-[1.02] transition-all">
              <div className="text-6xl md:text-8xl mb-6 animate-bounce">🔐</div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-white drop-shadow-lg">
                Step 1: Connect Your Wallet
              </h2>
              <p className="mb-8 text-white/90 text-lg font-semibold">
                Unlock the gateway to your digital destiny
              </p>

              {wallet && (
                <div className="mb-6 bg-green-500/30 border-2 border-green-400 rounded-2xl p-4 text-sm backdrop-blur-sm">
                  <p className="text-white font-bold">
                    ✅ Connected: {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                  </p>
                </div>
              )}

              <button
                onClick={connectWallet}
                disabled={loading || !!wallet}
                className={`${
                  wallet
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
                } text-white font-black py-4 px-8 rounded-2xl w-full text-xl transition-all transform hover:scale-105 active:scale-95`}
              >
                {loading ? "Connecting..." : wallet ? "✅ Wallet Connected" : "🔗 Connect Wallet"}
              </button>

              {wallet && (
                <button
                  onClick={() => setStep("story")}
                  className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black py-4 px-8 rounded-2xl w-full text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Continue to Story →
                </button>
              )}
            </div>
          )}

          {/* Story Step */}
          {step === "story" && (
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-white/30 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-8 text-center text-white drop-shadow-lg">
                🎭 The Legend of Aura Creatures
              </h2>

              <div className="space-y-6 mb-8 text-white/95 text-lg leading-relaxed">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/20">
                  <p className="font-bold text-2xl mb-2">🌟 In a realm where digital magic meets blockchain...</p>
                  <p>
                    Every wallet holds a unique essence, a signature that defines who you are in this vast digital
                    universe. Your Aura Creature is waiting to be born, shaped by the very essence of your wallet
                    address.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-white/20">
                  <p className="font-bold text-2xl mb-2">🎨 The AI Magic</p>
                  <p>
                    Our AI will analyze your unique wallet signature and create a one-of-a-kind creature just for you.
                    Each trait—color, expression, outfit, and more—is determined by your wallet&apos;s unique identity.
                    No two creatures are ever the same!
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-white/20">
                  <p className="font-bold text-2xl mb-2">✨ Eternal on Base</p>
                  <p>
                    Once created, your creature becomes a permanent NFT on Base blockchain, a testament to your journey
                    in the Web3 world. Own a piece of digital history that&apos;s uniquely yours!
                  </p>
                </div>
              </div>

              {wallet && (
                <div className="mb-6 p-4 bg-purple-500/30 border-2 border-purple-400 rounded-2xl text-sm backdrop-blur-sm">
                  <p className="text-white font-bold">
                    <span className="text-2xl">👛</span> Wallet: {wallet.substring(0, 6)}...
                    {wallet.substring(wallet.length - 4)}
                  </p>
                </div>
              )}

              <button
                onClick={generateNFT}
                disabled={loading || !wallet}
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-700 hover:via-pink-600 hover:to-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-black py-5 px-8 rounded-2xl w-full text-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl disabled:transform-none"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    ✨ CREATE MY AURA CREATURE ✨
                    <br />
                    <span className="text-lg">Let the magic begin! 🚀</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Generating Step */}
          {step === "generating" && (
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center border-2 border-white/30 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-8 text-white drop-shadow-lg animate-pulse">
                Creating Your Legend...
              </h2>

              <div className="mb-8">
                <div className="text-8xl md:text-9xl mb-6 animate-spin-slow">🎨</div>
                <div className="bg-black/30 rounded-2xl p-6 mb-6 border-2 border-white/20">
                  <p className="text-xl md:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 animate-pulse">
                    {currentMessage}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-6 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${generationProgress}%` }}
                    >
                      <span className="text-white text-xs font-bold">{Math.round(generationProgress)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-white/80 text-sm">
                <p className="animate-pulse">🔄 The AI is working its magic...</p>
                <p>⏳ This may take 15-30 seconds</p>
                <p className="text-yellow-300 font-bold">✨ Sit back and watch the story unfold! ✨</p>
              </div>
            </div>
          )}

          {/* Generated Step */}
          {step === "generated" && generated && (
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-white/30 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-8 text-center text-white drop-shadow-lg animate-pulse">
                🎉 YOUR AURA CREATURE IS READY! 🎉
              </h2>

              <div className="mb-8">
                {generated.preview && (
                  <div className="mb-6 animate-fade-in">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={generated.preview}
                        alt="Generated NFT"
                        className="relative w-full rounded-3xl border-4 border-white/50 shadow-2xl transform group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                )}

                {!generated.preview && generated.imageUrl && (
                  <div className="mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generated.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                      alt="Generated NFT"
                      className="w-full rounded-3xl border-4 border-white/50 shadow-2xl"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(generated.traits).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm p-4 rounded-2xl border-2 border-white/20 transform hover:scale-105 transition-all"
                    >
                      <div className="font-black capitalize text-purple-200 text-sm mb-1">{key}</div>
                      <div className="text-white font-bold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={requestMintPermit}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-black py-5 px-8 rounded-2xl w-full text-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    🚀 MINT MY NFT ON BASE 🚀
                    <br />
                    <span className="text-lg">Make it permanent! 💎</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Minting Step */}
          {step === "minting" && (
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center border-2 border-white/30 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-8 text-white drop-shadow-lg">
                Minting Your NFT...
              </h2>
              <div className="text-8xl md:text-9xl mb-6 animate-spin-slow">⚡</div>
              <p className="text-white text-xl font-bold">Your creature is being minted on Base blockchain</p>
              <p className="text-white/80 mt-4">This will take just a moment...</p>
            </div>
          )}

          {/* Minted Step */}
          {step === "minted" && (
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center border-2 border-white/30 shadow-2xl animate-fade-in">
              <div className="text-8xl md:text-9xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400">
                SUCCESS!
              </h2>
              <p className="text-2xl md:text-3xl text-white font-bold mb-6 drop-shadow-lg">
                Your Aura Creature NFT has been minted!
              </p>
              <div className="text-6xl mb-6 animate-pulse">✨</div>
              <p className="text-white/90 text-lg font-semibold">Check your wallet to see your new NFT</p>
              <div className="mt-8 space-y-2">
                <p className="text-yellow-300 font-bold text-xl">🚀 Welcome to the Aura Creatures family! 🚀</p>
                <p className="text-white/80">Share your creation with the world!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center">
          <div className="text-white text-4xl font-black animate-pulse">Loading...</div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
