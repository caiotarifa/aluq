function formatUnit(size, units, unitIndex = 0) {
  if (size < 1024 || unitIndex >= units.length - 1) {
    return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
  }

  return formatUnit(size / 1024, units, unitIndex + 1)
}

export function formatBytes(bytes) {
  if (!bytes) return ''

  const units = ['B', 'KB', 'MB', 'GB']
  return formatUnit(bytes, units)
}
