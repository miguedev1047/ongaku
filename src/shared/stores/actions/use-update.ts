import { create } from "zustand"
import { relaunch } from "@tauri-apps/plugin-process"
import { toast } from "sonner"
import type { Update } from "@tauri-apps/plugin-updater"
import i18n from "@/lib/i18n"

export type UpdateStatus =
  | "idle"
  | "downloading"
  | "installing"
  | "done"
  | "error"

interface UpdateProgress {
  downloaded: number
  total: number
  percentage: number
}

interface UpdateStoreProps {
  status: UpdateStatus
  progress: UpdateProgress
  setStatus: (status: UpdateStatus) => void
  setProgress: (downloaded: number, total: number) => void
  startInstallUpdate: (update: Update) => Promise<void>
  simulateUpdateDemo: () => Promise<void>
  reset: () => void
}

const RESTARTING_DELAY = 1500

export const useUpdateStore = create<UpdateStoreProps>((set, get) => ({
  status: "idle",
  progress: {
    downloaded: 0,
    total: 0,
    percentage: 0
  },

  setStatus: (status) => set({ status }),

  setProgress: (downloaded, total) => {
    const percentage =
      total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : 0
    set({ progress: { downloaded, total, percentage } })
  },

  startInstallUpdate: async (update: Update) => {
    const currentStatus = get().status
    if (currentStatus === "downloading" || currentStatus === "installing") {
      return
    }

    set({
      status: "downloading",
      progress: { downloaded: 0, total: 0, percentage: 0 }
    })

    toast.loading(i18n.t("toasts.updater.downloading"), {
      id: "updater-toast"
    })

    let downloaded = 0
    let total = 0

    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            total = event.data.contentLength ?? 0
            get().setProgress(0, total)
            return
          case "Progress":
            downloaded += event.data.chunkLength
            get().setProgress(downloaded, total)
            return
          case "Finished":
            set({ status: "installing" })
            return
          default:
            return
        }
      })

      set({ status: "done" })
      toast.success(i18n.t("toasts.updater.installed_success"), {
        id: "updater-toast"
      })
      setTimeout(async () => await relaunch(), RESTARTING_DELAY)
    } catch (err) {
      set({
        status: "error",
        progress: { downloaded: 0, total: 0, percentage: 0 }
      })
      toast.error(i18n.t("toasts.updater.update_error"), {
        id: "updater-toast"
      })
      console.error(err)
    }
  },

  simulateUpdateDemo: async () => {
    const currentStatus = get().status
    if (currentStatus === "downloading" || currentStatus === "installing") {
      return
    }

    set({
      status: "downloading",
      progress: { downloaded: 0, total: 100, percentage: 0 }
    })

    toast.loading("Simulating update download... [DEV MODE]", {
      id: "updater-toast"
    })

    const totalSteps = 20
    const stepDuration = 250 // ~5 seconds total

    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration))
      if (get().status !== "downloading") return
      get().setProgress(i * 5, 100)
    }

    set({ status: "installing" })
    toast.loading("Simulating update installation... [DEV MODE]", {
      id: "updater-toast"
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))
    if (get().status !== "installing") return

    set({ status: "done" })
    toast.success("Update simulation complete! [DEV MODE]", {
      id: "updater-toast"
    })

    setTimeout(() => {
      if (get().status === "done") {
        get().reset()
      }
    }, 3500)
  },

  reset: () =>
    set({
      status: "idle",
      progress: { downloaded: 0, total: 0, percentage: 0 }
    })
}))
