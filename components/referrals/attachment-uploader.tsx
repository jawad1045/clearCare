"use client";

import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Loader2, FileText, ImageIcon } from "lucide-react";

const MAX_IMAGES = 5;
const MAX_PDF = 1;

interface UploadedFile {
  name: string;
  url: string;
}

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function AttachmentUploader({ value, onChange }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<UploadedFile[]>([]);

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: (err) => {
      setError(err.message);
      setPending(false);
    },
  });

  function validate(files: File[]): string | null {
    const newImages = files.filter((f) => f.type.startsWith("image/"));
    const newPdfs = files.filter((f) => f.type === "application/pdf");
    const other = files.filter(
      (f) => !f.type.startsWith("image/") && f.type !== "application/pdf"
    );

    if (other.length > 0) {
      return "Only images and PDF files are allowed.";
    }
    if (newImages.length > 0 && newPdfs.length > 0) {
      return "Upload either images or a PDF — not both.";
    }

    const existingImages = fileNames.filter((f) => !isPdf(f.name));
    const existingPdfs = fileNames.filter((f) => isPdf(f.name));

    if (newPdfs.length > 0 && existingImages.length > 0) {
      return "You already have images attached. Remove them before uploading a PDF.";
    }
    if (newImages.length > 0 && existingPdfs.length > 0) {
      return "You already have a PDF attached. Remove it before uploading images.";
    }
    if (existingPdfs.length + newPdfs.length > MAX_PDF) {
      return `You can only upload ${MAX_PDF} PDF file.`;
    }
    if (existingImages.length + newImages.length > MAX_IMAGES) {
      return `You can only upload up to ${MAX_IMAGES} images total.`;
    }

    return null;
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    setError(null);
    const err = validate(files);
    if (err) {
      setError(err);
      return;
    }

    setPending(true);
    const res = await startUpload(files);
    if (res) {
      const uploaded = res.map((r, i) => ({ name: files[i]?.name ?? r.name, url: r.ufsUrl }));
      setFileNames((prev) => [...prev, ...uploaded]);
      onChange([...value, ...uploaded.map((u) => u.url)]);
    }
    setPending(false);
  }

  function remove(url: string) {
    setFileNames((prev) => prev.filter((f) => f.url !== url));
    onChange(value.filter((u) => u !== url));
  }

  const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-3">
      {/* Uploaded file list */}
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

      {/* Upload buttons */}
      <div className="space-y-1.5">
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending || fileNames.some((f) => isPdf(f.name))}
            onClick={() => imageInputRef.current?.click()}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {pending ? "Uploading…" : "Images"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending || fileNames.some((f) => !isPdf(f.name))}
            onClick={() => pdfInputRef.current?.click()}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {pending ? "Uploading…" : "PDF"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Upload up to {MAX_IMAGES} images <span className="text-muted-foreground/60">or</span> {MAX_PDF} PDF
        </p>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}
