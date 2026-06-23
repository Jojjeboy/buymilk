/**
 * Parses raw recipe text into a list of cleaned ingredient names.
 * It attempts to remove quantities, measurements, and common filler words.
 */
export function parseRecipeText(text: string): string[] {
  if (!text.trim()) return [];

  // Split by newlines or commas
  const lines = text.split(/\r?\n|,/);

  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      let cleaned = line;

      // 1. Remove common quantity patterns:
      // - Fractions (1/2, 1 1/2)
      // - Decimals (0.5)
      // - Whole numbers
      // - Units (cup, tbsp, tsp, g, kg, ml, l, oz, lb, pinch, handful, etc.)
      // - Range (1-2)
      const quantityRegex = /^(?:\d+\s+)?(?:\d+\/\d+|\d*\.\d+|\d+)\s*(?:cup|tbsp|tsp|tablespoon|teaspoon|g|kg|ml|l|oz|lb|pound|ounce|pinch|handful|clove|can|bottle|package|pack|slice|piece|sprig|bunch|gram|kilogram|milliliter|liter)?\s*(?:of)?\s*/i;
      
      cleaned = cleaned.replace(quantityRegex, '');

      // 2. Remove leading bullet points or dashes
      cleaned = cleaned.replace(/^[\s•\-*]+/, '');

      // 3. Remove common filler words at the start
      cleaned = cleaned.replace(/^(?:fresh|dried|chopped|diced|minced|sliced|grated)\s+/i, '');

      return cleaned.trim();
    })
    .filter(line => line.length > 0);
}