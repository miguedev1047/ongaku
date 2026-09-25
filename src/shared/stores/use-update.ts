import { create } from "zustand"

export type UpdateStatus =
  "idle" | "downloading" | "installing" | "done" | "error"

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
  reset: () => void
}

export const useUpdateStore = create<UpdateStoreProps>((set) => ({
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

  reset: () =>
    set({
      status: "idle",
      progress: { downloaded: 0, total: 0, percentage: 0 }
    })
}))
