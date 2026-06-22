/**
 * Check if a keyword matches within text as a whole word (not as part of a longer word).
 * Uses Unicode-aware letter detection (\p{L}) so Swedish characters (ö, ä, å) are handled.
 * 
 * Examples:
 *   matchesWholeWord("mjöl", "mjöl")  → true  (exact match)
 *   matchesWholeWord("mjölk", "mjöl") → false (mjöl is prefix of mjölk)
 *   matchesWholeWord("2 mjölk", "mjölk") → true (space before, end of string after)
 *   matchesWholeWord("mjölk och ägg", "mjölk") → true (start of string, space after)
 */
export const matchesWholeWord = (text: string, keyword: string): boolean => {
    const lowerText = text.toLowerCase();
    const kw = keyword.toLowerCase();
    const idx = lowerText.indexOf(kw);
    if (idx === -1) return false;

    // Check that the match isn't part of a longer word
    const charBefore = idx > 0 ? lowerText[idx - 1] : '';
    const charAfter = idx + kw.length < lowerText.length ? lowerText[idx + kw.length] : '';
    const isLetterBefore = charBefore !== '' && /\p{L}/u.test(charBefore);
    const isLetterAfter = charAfter !== '' && /\p{L}/u.test(charAfter);
    return !isLetterBefore && !isLetterAfter;
};

/**
 * Check if any keyword in a category matches the given item text.
 */
export const matchesCategoryKeywords = (
    text: string,
    keywords: string[] | undefined
): boolean => {
    if (!keywords || keywords.length === 0) return false;
    return keywords.some(keyword => matchesWholeWord(text, keyword));
};
