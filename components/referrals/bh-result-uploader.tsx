"use client";

import { useRef, useState, useTransition } from "react";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Upload, Download } from "lucide-react";
import { updateBHReferralResult } from "@/action/bh-referral.action";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/locale/use-translation";

interface Props {
  referralId: number;
  currentResult: string | null;
}

export function BHResultUploader({ referralId, currentResult }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState(currentResult);
  const [isPending, startTransition] = useTransition();

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: (err) => {
      toast.error(t("referrals.uploadFailedPrefix") + err.message);
      setUploading(false);
    },
  });

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    if (files[0].type !== "application/pdf") {
      toast.error(t("referrals.onlyPdfForResults"));
      return;
    }

    setUploading(true);
    const res = await startUpload([files[0]]);
    setUploading(false);

    if (res?.[0]) {
      const url = res[0].ufsUrl;
      startTransition(async () => {
        try {
          await updateBHReferralResult(referralId, url);
          setResultUrl(url);
          toast.success(t("referrals.resultUploadSuccess"));
        } catch {
          toast.error(t("referrals.resultUploadFailed"));
        }
      });
    }
  }

  const busy = uploading || isPending;

  return (
    <div className="space-y-3">
      {resultUrl ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0 text-red-400" />
            <span className="truncate font-medium">{t("referrals.resultReportPdf")}</span>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5">
            <Link href={resultUrl} target="_blank" rel="noopener noreferrer" download>
              <Download className="h-3.5 w-3.5" />
              {t("common.download")}
            </Link>
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">{t("referrals.noResultYet")}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? t("referrals.uploading") : resultUrl ? t("referrals.replaceResultPdf") : t("referrals.uploadResultPdf")}
      </Button>
    </div>
  );
}
