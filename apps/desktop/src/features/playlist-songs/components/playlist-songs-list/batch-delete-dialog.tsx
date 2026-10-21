import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            <Show
              when={count === 1}
              fallback={t("playlists.batch.delete_dialog_title_plural", { count })}
            >
              {t("playlists.batch.delete_dialog_title", { count })}
            </Show>
          </DialogTitle>
          <DialogDescription>
            <Show
              when={count === 1}
              fallback={t("playlists.batch.delete_dialog_desc_plural")}
            >
              {t("playlists.batch.delete_dialog_desc")}
            </Show>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isProcessing}
              >
                {t("common.cancel")}
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
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
