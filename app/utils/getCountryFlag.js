export function getCountryFlag(code) {
  if (!code || code.length !== 2) {
    return '🏳️'
  }

  const offset = 127397
  const parts = []

  for (const char of code.toUpperCase()) {
    parts.push(String.fromCodePoint(char.charCodeAt(0) + offset))
  }

  return parts.join('')
}
