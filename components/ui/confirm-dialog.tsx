"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/locale/use-translation"

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
  confirmLabel?: string
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title ?? t("common.confirmSubmissionTitle")}</DialogTitle>
          <DialogDescription>{description ?? t("common.confirmSubmissionDescription")}</DialogDescription>
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {confirmLabel ?? t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
