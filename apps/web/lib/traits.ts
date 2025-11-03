import { createHash } from "crypto";
import type { Traits } from "@/lib/types";

// 4 core traits only (reduced from 7)
const colors = ["Green", "Blue", "Red", "Yellow", "Purple", "Orange", "Pink", "Cyan"];
const eyes = ["Round", "Narrow", "Wide", "Sleepy", "Angry", "Happy", "Surprised", "Winking"];
const mouths = ["Smile", "Grin", "Neutral", "Open", "Tongue", "Frown", "Whistle", "Teeth"];
const backgrounds = ["Sky", "Forest", "Ocean", "Mountain", "City", "Desert", "Space", "Abstract"];

export function generateSeed(walletAddress: string): string {
  const hash = createHash("sha256")
    .update(walletAddress.toLowerCase())
    .digest("hex");
  return hash.substring(0, 16);
}

export function seedToTraits(seed: string): Traits {
  const hash = createHash("sha256").update(seed).digest("hex");
  
  function pickFromArray<T>(arr: T[], hashSlice: string): T {
    const index = parseInt(hashSlice, 16) % arr.length;
    return arr[index];
  }
  
  // Only 4 traits: color, eyes, mouth, bg
  return {
    color: pickFromArray(colors, hash.substring(0, 2)),
    eyes: pickFromArray(eyes, hash.substring(2, 4)),
    mouth: pickFromArray(mouths, hash.substring(4, 6)),
    bg: pickFromArray(backgrounds, hash.substring(6, 8)),
  };
}

export function buildPrompt(traits: Traits, theme: string = "frog"): string {
  return `Hyper-realistic portrait of original lifelike creature. Fixed base: big expressive eyes with natural reflections, rounded soft body, realistic skin texture, humanoid stance, gentle smile. Varies: body color=${traits.color}, eye style=${traits.eyes}, expression=${traits.mouth}, background=${traits.bg}. Photo-realistic, volumetric lighting, cinematic bokeh, soft focus, ultra detailed eyes, expressive face, realistic skin texture, emotional depth, 8k render, unreal engine realism, studio photo composition, shallow depth of field, 1024x1024, no text.`;
}

/**
 * Generate unique NFT name based on wallet address and traits
 */
export function generateNFTName(walletAddress: string, traits: Traits): string {
  // Create a unique name based on wallet hash and traits
  const hash = createHash("sha256")
    .update(walletAddress.toLowerCase())
    .digest("hex");
  
  const nameIndex = parseInt(hash.substring(0, 4), 16) % 1000;
  const traitBased = `${traits.color} ${traits.eyes}`;
  
  return `Aura Creature #${nameIndex} - ${traitBased}`;
}

