import { useQuery } from "@tanstack/react-query"
import {
  systemUpdatesQueryOptions,
  systemBinariesInfoQueryOptions,
  systemHealthQueryOptions
} from "@/shared/queries/system"

export type AppStateStatus = "idle" | "update" | "error"

export interface AppStatusResult {
  status: AppStateStatus
  badgeText?: string
  tooltipText: string
  hasUpdate: boolean
  hasError: boolean
  updateVersion?: string
  errorReasons: string[]
}

export function useAppStatus(): AppStatusResult {
  const { data: update } = useQuery(systemUpdatesQueryOptions())
  const { data: binariesInfo } = useQuery(systemBinariesInfoQueryOptions())
  const { data: health } = useQuery(systemHealthQueryOptions())

  const errorReasons: string[] = []

  // Check 1: Auxiliary binaries
  if (binariesInfo) {
    if (!binariesInfo.ytdlp_installed) {
      errorReasons.push("yt-dlp is not installed")
    }
    if (!binariesInfo.ffmpeg_installed) {
      errorReasons.push("ffmpeg is not installed")
    }
  }

  // Check 2: Server health
  if (health && !health.serverHealthy) {
    errorReasons.push("Internal audio streaming server is offline")
  }

  // Check 3: Directory permissions and existence
  if (health?.directories) {
    for (const dir of health.directories) {
      if (!dir.exists) {
        errorReasons.push(`Directory missing: ${dir.name}`)
      } else if (!dir.writable) {
        errorReasons.push(`Directory not writable: ${dir.name}`)
      }
    }
  }

  const hasError = errorReasons.length > 0
  const hasUpdate = Boolean(update?.version)

  if (hasError) {
    return {
      status: "error",
      badgeText: "Issue",
      tooltipText: `Settings • ${errorReasons.length} system ${errorReasons.length === 1 ? "issue" : "issues"} detected`,
      hasError: true,
      hasUpdate,
      updateVersion: update?.version,
      errorReasons
    }
  }

  if (hasUpdate && update) {
    return {
      status: "update",
      badgeText: `v${update.version}`,
      tooltipText: `Settings • Update available: v${update.version}`,
      hasError: false,
      hasUpdate: true,
      updateVersion: update.version,
      errorReasons: []
    }
  }

  return {
    status: "idle",
    badgeText: undefined,
    tooltipText: "Settings & System Status",
    hasError: false,
    hasUpdate: false,
    updateVersion: undefined,
    errorReasons: []
  }
}
