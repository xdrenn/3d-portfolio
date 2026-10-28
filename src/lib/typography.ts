/** Short words that must never stay alone at the end of a line. */
const SHORT_WORDS = /(^|\s)(a|an|the|I|to|in|of|on|at|as|by|so|or|and|but|for|with|from|into|that|one)\s+/gi;

/**
 * Keeps the text from breaking in ugly places: a short word is glued to the word after it,
 * and a dash is glued to the word before it, so a line never ends on "to" or starts with "—".
 * The last three words are glued too.
 */
export function tie(text: string): string {
  const NBSP = " ";
  return text
    .replace(/ — /g, `${NBSP}— `)
    .replace(SHORT_WORDS, (_, start: string, word: string) => `${start}${word}${NBSP}`)
    .replace(SHORT_WORDS, (_, start: string, word: string) => `${start}${word}${NBSP}`)
    // The last three words stay together, so a paragraph never ends on a lonely word.
    .replace(/\s+(\S+)\s+(\S+)$/, `${NBSP}$1${NBSP}$2`);
}
