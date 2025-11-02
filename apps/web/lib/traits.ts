import { createHash } from "crypto";
import type { Traits } from "@/lib/types";

const colors = ["Green", "Blue", "Red", "Yellow", "Purple", "Orange", "Pink", "Cyan"];
const eyes = ["Round", "Narrow", "Wide", "Sleepy", "Angry", "Happy", "Surprised", "Winking"];
const ears = ["Pointed", "Round", "Fluffy", "Small", "Large", "Asymmetric", "Hidden", "Spiky"];
const mouths = ["Smile", "Grin", "Neutral", "Open", "Tongue", "Frown", "Whistle", "Teeth"];
const outfits = ["T-Shirt", "Hoodie", "Sweater", "Jacket", "Formal Shirt", "Coat", "Uniform", "Casual Wear"];
const hands = ["None", "Wand", "Book", "Crystal", "Flower", "Coin", "Gem", "Star"];
const backgrounds = ["Sky", "Forest", "Ocean", "Mountain", "City", "Desert", "Space", "Abstract"];

export function generateSeed(xUserId: string, profileImageUrl: string): string {
  const hash = createHash("sha256")
    .update(`${xUserId}:${profileImageUrl}`)
    .digest("hex");
  return hash.substring(0, 16);
}

export function seedToTraits(seed: string): Traits {
  const hash = createHash("sha256").update(seed).digest("hex");
  
  function pickFromArray<T>(arr: T[], hashSlice: string): T {
    const index = parseInt(hashSlice, 16) % arr.length;
    return arr[index];
  }
  
  return {
    color: pickFromArray(colors, hash.substring(0, 2)),
    eyes: pickFromArray(eyes, hash.substring(2, 4)),
    ears: pickFromArray(ears, hash.substring(4, 6)),
    mouth: pickFromArray(mouths, hash.substring(6, 8)),
    outfit: pickFromArray(outfits, hash.substring(8, 10)),
    hand: pickFromArray(hands, hash.substring(10, 12)),
    bg: pickFromArray(backgrounds, hash.substring(12, 14)),
  };
}

export function buildPrompt(traits: Traits, theme: string = "frog"): string {
  return `Hyper-realistic portrait of original lifelike creature. Fixed base: big expressive eyes with natural reflections, rounded soft body, realistic skin texture, humanoid stance, gentle smile. Varies: body color=${traits.color}, hand item=${traits.hand}, expression=${traits.mouth}, outfit=${traits.outfit}, background=${traits.bg}. Photo-realistic, volumetric lighting, cinematic bokeh, soft focus, ultra detailed eyes, expressive face, realistic skin texture, emotional depth, 8k render, unreal engine realism, studio photo composition, shallow depth of field, 1024x1024, no text.`;
}

