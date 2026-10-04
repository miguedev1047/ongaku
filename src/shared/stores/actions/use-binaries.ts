import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import type { QueryClient } from '@tanstack/react-query'
import i18n from '@/lib/i18n'

export type BinariesStatus = 'idle' | 'installing' | 'done' | 'error'

interface BinariesStoreProps {
  status: BinariesStatus
  setStatus: (status: BinariesStatus) => void
  installBinaries: (queryClient?: QueryClient) => Promise<boolean>
  reset: () => void
}

export const useBinariesStore = create<BinariesStoreProps>((set, get) => ({
  status: 'idle',

  setStatus: (status) => set({ status }),

  installBinaries: async (queryClient) => {
    const currentStatus = get().status
    if (currentStatus === 'installing') {
      return false
    }

    set({ status: 'installing' })

    try {
      await invoke('download_binaries')
      set({ status: 'done' })
      toast.success(i18n.t('toasts.tools.installed_success'))
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['system'] })
      }
      return true
    } catch (error) {
      set({ status: 'error' })
      toast.error(i18n.t('toasts.tools.install_error'))
      console.error(error)
      return false
    }
  },

  reset: () => set({ status: 'idle' }),
}))
