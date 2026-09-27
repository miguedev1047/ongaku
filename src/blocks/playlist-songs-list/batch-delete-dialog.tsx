import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Show } from "@/components/utility/show"

interface BatchDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  onConfirm: () => void
  isProcessing: boolean
}

export function BatchDeleteDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
  isProcessing
}: BatchDeleteDialogProps) {
  const songLabel = count === 1 ? "song" : "songs"
  const thisSongLabel = count === 1 ? "this song" : "these songs"

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            Delete {count} {songLabel}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {thisSongLabel}? This action cannot
            be undone and will permanently remove the files from your computer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            }
          />
          <Button
            disabled={isProcessing}
            onClick={onConfirm}
            variant="destructive"
          >
            <Show when={isProcessing}>
              <Spinner />
            </Show>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
