import { platformService } from '@/infrastructure/platform'
import { toast } from 'sonner'
import i18n from '@/lib/i18n'

const RELEASES_BASE_URL = 'https://github.com/miguedev1047/ongaku/releases'

/** Strict semver-ish check so we never build a URL from arbitrary input. */
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/

export function getReleaseNotesUrl(version?: string): string {
  const clean = version?.trim().replace(/^v/, '')
  if (!clean || !VERSION_PATTERN.test(clean)) return RELEASES_BASE_URL
  return `${RELEASES_BASE_URL}/tag/v${encodeURIComponent(clean)}`
}

/**
 * Opens the GitHub release notes in the user's default browser.
 * Only ever opens URLs under the project's own releases page.
 */
export async function openReleaseNotes(version?: string): Promise<void> {
  const url = getReleaseNotesUrl(version)

  if (!url.startsWith(`${RELEASES_BASE_URL}`)) return

  try {
    await platformService.openUrl(url)
  } catch (error) {
    console.error('Failed to open release notes:', error)
    toast.error(i18n.t('toasts.updater.notes_error'))
  }
}
