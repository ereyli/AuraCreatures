// Professional NFT generation story - English version
export const generationMessages = [
  "In the depths of the blockchain, a spark of digital consciousness awakens...",
  "Your wallet&apos;s unique signature begins to resonate with the quantum realm...",
  "The AI brushes paint with precision, sketching the first outline of your creature...",
  "Two luminous eyes emerge from the void, reflecting your digital identity...",
  "Personality traits crystallize - each trait more unique than the last...",
  "Colors come to life, painting the canvas of existence...",
  "A distinctive outfit materializes, woven from threads of imagination...",
  "Distinctive artifacts appear in its hands - tokens of your Web3 journey...",
  "Reality bends as a breathtaking background takes shape around it...",
  "The creature draws its first breath of digital life...",
  "Final touches are applied - every pixel perfectly aligned...",
  "The grand reveal approaches! Your Aura Creature is almost ready...",
  "Your unique NFT creature has been born!",
];

export function getGenerationMessage(progress: number): string {
  const index = Math.min(
    Math.floor((progress / 100) * generationMessages.length),
    generationMessages.length - 1
  );
  return generationMessages[index];
}
