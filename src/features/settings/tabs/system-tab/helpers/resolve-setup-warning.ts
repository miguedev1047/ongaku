import type { TFunction } from 'i18next'

/**
 * Maps the machine-readable codes emitted by the Rust Discord service
 * (`src-tauri/src/services/discord.rs`) to localized messages.
 *
 * Only checks that do not require credentials are reported here. Rich Presence
 * asset keys cannot be verified from outside Discord (assets are served by asset
 * id, and listing them needs authentication), so a wrong key shows up at runtime
 * as `activity_error` instead.
 *
 * Unknown codes are rendered verbatim so a new backend warning never ends up as
 * an empty alert.
 */
export function resolveSetupWarning(
  t: TFunction,
  warning: string | null | undefined,
): string | null {
  if (!warning) return null

  switch (warning) {
    case 'invalid_app_id':
      return t(
        'settings.tabs.system.discord_rpc.setup_warning.invalid_app_id',
        {
          defaultValue:
            'The configured Discord application ID is invalid, so Rich Presence cannot be published.',
        },
      )
    case 'application_not_found':
      return t(
        'settings.tabs.system.discord_rpc.setup_warning.application_not_found',
        {
          defaultValue:
            'The configured Discord application ID does not exist in the Discord Developer Portal.',
        },
      )
    default:
      return warning
  }
}
