import { tauriAdapter } from "@/infrastructure/platform/tauri.adapter"
import type { PlatformService } from "@/infrastructure/platform/platform.types"

export const platformService: PlatformService = tauriAdapter

export * from "@/infrastructure/platform/platform.types"
