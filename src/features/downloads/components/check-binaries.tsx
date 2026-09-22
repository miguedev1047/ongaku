import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { checkBinariesQueryOpts } from "@/shared/queries/binaries"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

export function CheckBinaries() {
  const { data: isBinariesInstalled } = useSuspenseQuery(
    checkBinariesQueryOpts()
  )

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      return await invoke("download_binaries")
    },
    onSuccess: () => {
      toast.success("Binaries installed successfully")
      queryClient.invalidateQueries({ queryKey: ["check-binaries"] })
    },
    onError: () => {
      toast.error("An error occurred while downloading the binaries")
    }
  })

  const isPending = mutation.isPending

  const handleDownloadBinaries = () => {
    mutation.mutate()
  }

  if (isBinariesInstalled) return null

  return (
    <div className="space-y-2">
      <h3>{isPending ? "Installing..." : "No binaries installed yet"}</h3>

      <Button
        onClick={handleDownloadBinaries}
        disabled={isPending}
      >
        {isPending && <Spinner />}
        Download Binaries
      </Button>
    </div>
  )
}
