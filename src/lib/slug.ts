// Strip Unicode combining diacritical marks (U+0300-U+036F) left behind by
// NFD normalization, e.g. turning "á" into "a" + combining acute accent.
const COMBINING_MARKS = new RegExp(`[̀-ͯ]`, 'g')

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
