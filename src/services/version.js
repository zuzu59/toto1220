export function compareSemver(a, b) {
  const left = String(a || '0.0.0').replace(/^v/, '').split('.').map(Number)
  const right = String(b || '0.0.0').replace(/^v/, '').split('.').map(Number)
  for (let index = 0; index < 3; index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0)
    if (diff !== 0) return diff
  }
  return 0
}
