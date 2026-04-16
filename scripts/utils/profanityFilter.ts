import badWords from "./badWords";

// Returns whether the input string contains foul language
// NOTE: bad words is a bit too restrictive, might want to fix later
export function containsFoulLanguage(input: string): boolean {
  if (!input) return false;

  const normalizedText = input.toLowerCase();

  return badWords.some((word) => {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
    return pattern.test(normalizedText);
  });
}

// Prevent regex from breaking if word has special chars
function escapeRegex(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
