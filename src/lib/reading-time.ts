/**
 * Durée de lecture affichée, en minutes.
 * Reçoit le texte déjà réduit en clair. Renvoie au moins 1.
 */
export function readingMinutes(plainText: string): number {
  const words = plainText.trim().split(/\s+/).filter(Boolean);
  // Plancher à 1 : un texte court ne doit pas s'afficher comme une lecture de zéro minute.
  return Math.max(1, Math.round(words.length / 200));
}
