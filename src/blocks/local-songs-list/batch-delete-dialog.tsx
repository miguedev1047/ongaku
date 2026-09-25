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
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            Delete {count} {count === 1 ? "song" : "songs"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count === 1 ? "this song" : "these songs"}?
            This action cannot be undone and will permanently remove the files from your computer.
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
            {isProcessing && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
