"use client";

import { useRef, useState } from "react";
import { uploadFileToDropbox } from "@/lib/utils/dropbox-upload";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Loader2, FileText, ImageIcon } from "lucide-react";
import { encodeAttachment } from "@/lib/parse-attachment";
import { useTranslation } from "@/locale/use-translation";

const MAX_FILES = 5;

interface UploadedFile {
  name: string;
  url: string;
}

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function AttachmentUploader({ value, onChange }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<UploadedFile[]>([]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    setError(null);

    const invalid = files.filter(
      (f) => !f.type.startsWith("image/") && f.type !== "application/pdf"
    );
    if (invalid.length > 0) {
      setError(t("referrals.onlyImagesAndPdf"));
      return;
    }

    if (fileNames.length + files.length > MAX_FILES) {
      setError(t("referrals.maxFilesError", { max: MAX_FILES }));
      return;
    }

    setPending(true);
    setError(null);

    try {
      const uploaded = [] as UploadedFile[];
      for (const file of files) {
        const result = await uploadFileToDropbox(file);
        uploaded.push({ name: result.name ?? file.name, url: result.url });
      }

      setFileNames((prev) => [...prev, ...uploaded]);
      onChange([...value, ...uploaded.map((u) => encodeAttachment(u.name, u.url))]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  function remove(actualUrl: string) {
    setFileNames((prev) => prev.filter((f) => f.url !== actualUrl));
    onChange(value.filter((stored) => {
      try { return JSON.parse(stored).u !== actualUrl; } catch { return stored !== actualUrl; }
    }));
  }

  const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-3">
      {fileNames.length > 0 && (
        <ul className="space-y-2">
          {fileNames.map((f) => (
            <li
              key={f.url}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isPdf(f.name) ? (
                  <FileText className="h-4 w-4 shrink-0 text-red-400" />
                ) : (
                  <ImageIcon className="h-4 w-4 shrink-0 text-sky-400" />
                )}
                <span className="truncate text-foreground">{f.name}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(f.url)}
                className="shrink-0 rounded p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-1.5">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || fileNames.length >= MAX_FILES}
          onClick={() => inputRef.current?.click()}
          className="gap-2"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
          {pending ? t("referrals.uploading") : t("referrals.attachFiles")}
        </Button>

        <p className="text-xs text-muted-foreground">
          {t("referrals.attachmentsHint", { max: MAX_FILES })}
        </p>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
