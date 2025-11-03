// Epic NFT generation story - English version
export const generationMessages = [
  "🌌 In the depths of the blockchain, a spark of digital consciousness awakens...",
  "✨ Your wallet&apos;s unique signature begins to resonate with the quantum realm...",
  "🎨 The AI brushes paint with stardust, sketching the first outline of your creature...",
  "👁️ Two luminous eyes emerge from the void, reflecting your digital soul...",
  "🎭 Personality traits crystallize - each trait more unique than the last...",
  "🌈 Colors burst forth like a cosmic explosion, painting the canvas of existence...",
  "👔 A legendary outfit materializes, woven from threads of pure imagination...",
  "🤲 Mystical artifacts appear in its hands - tokens of your Web3 journey...",
  "🌍 Reality bends as a breathtaking background takes shape around it...",
  "⚡ Lightning strikes! The creature draws its first breath of digital life...",
  "🌟 Final cosmic touches are applied - every pixel perfectly aligned...",
  "🎪 The grand reveal approaches! Your Aura Creature is almost ready...",
  "🚀 IT&apos;S ALIVE! Your unique NFT creature has been born!",
];

export function getGenerationMessage(progress: number): string {
  const index = Math.min(
    Math.floor((progress / 100) * generationMessages.length),
    generationMessages.length - 1
  );
  return generationMessages[index];
}
