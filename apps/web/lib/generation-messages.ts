// Eğlenceli loading mesajları - NFT oluşturma hikayesi
export const generationMessages = [
  "✨ Büyülü bir yaratık doğmak üzere...",
  "🎨 AI, benzersiz özelliklerini çiziyor...",
  "🌟 Gözlerin parıltısını yaratıyor...",
  "🎭 Kişiliğini şekillendiriyor...",
  "🌈 Renklerin canlanmasını sağlıyor...",
  "✨ Özel kostümünü tasarlıyor...",
  "🔮 Arka planın büyüsünü hazırlıyor...",
  "💫 Son dokunuşlar yapılıyor...",
  "🎪 Neredeyse hazır!",
  "🚀 Yaratık doğuyor!",
];

export function getGenerationMessage(progress: number): string {
  const index = Math.min(
    Math.floor((progress / 100) * generationMessages.length),
    generationMessages.length - 1
  );
  return generationMessages[index];
}

