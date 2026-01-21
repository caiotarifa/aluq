/**
 * Converts a string into a URL-friendly slug.
 *
 * @param {string} input The string to convert.
 * @returns {string} The slugified string.
 */
export default function (input) {
  if (!input) return ''

  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
