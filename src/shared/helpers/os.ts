export function isLinuxPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent || ''
  const platform = (navigator as unknown as { platform?: string }).platform || ''
  return /linux/i.test(userAgent) || /linux/i.test(platform)
}
