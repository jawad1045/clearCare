"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Plus, Trash2, Save, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  getPendingReportRecipientsAction,
  savePendingReportRecipientsAction,
} from "@/action/pending-recipients.action";
import { SendPendingDigestButton } from "@/components/referrals/send-pending-digest-button";

const emailItemSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g. user@example.com)"),
});

const formSchema = z.object({
  recipients: z
    .array(emailItemSchema)
    .min(1, "At least one recipient email address is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function PendingRecipientsForm() {
  const [loading, setLoading] = useState(true);
  const [isSaving, startSaving] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipients: [{ email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipients",
  });

  // Fetch previous/current recipients on mount
  async function loadRecipients() {
    setLoading(true);
    try {
      const emails = await getPendingReportRecipientsAction();
      if (emails && emails.length > 0) {
        reset({
          recipients: emails.map((email) => ({ email })),
        });
      } else {
        reset({
          recipients: [{ email: "" }],
        });
      }
    } catch {
      toast.error("Failed to load existing pending report recipients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipients();
  }, []);

  function onSubmit(values: FormValues) {
    startSaving(async () => {
      try {
        const emails = values.recipients.map((r) => r.email.trim()).filter(Boolean);
        const res = await savePendingReportRecipientsAction(emails);
        toast.success("Pending report recipient emails updated successfully!");
        reset({
          recipients: res.recipients.map((email) => ({ email })),
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save recipient emails.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Pending Report Emails</h3>
          <p className="text-sm text-muted-foreground">
            Configure the email addresses that receive the daily 24-hour pending referrals summary.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={loadRecipients}
          disabled={loading || isSaving}
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Reload
        </Button>
      </div>

      <Separator />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Fetching current recipient emails...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Recipient Email Addresses ({fields.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ email: "" })}
                disabled={isSaving}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Email
              </Button>
            </div>

            {errors.recipients?.root && (
              <p className="text-xs font-medium text-destructive">
                {errors.recipients.root.message}
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const error = errors.recipients?.[index]?.email;
                return (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...register(`recipients.${index}.email`)}
                          placeholder="e.g. admin@example.com"
                          className="pl-9 text-sm"
                          disabled={isSaving}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1 || isSaving}
                        title="Remove email"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {error && (
                      <p className="text-xs font-medium text-destructive pl-1">
                        {error.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="submit" disabled={isSaving || !isDirty} className="min-w-[140px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Recipients
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border p-4 bg-muted/20 space-y-3 mt-6">
            <div>
              <h4 className="text-sm font-semibold">Test Sending Now</h4>
              <p className="text-xs text-muted-foreground">
                Trigger an immediate pending summary report email to check your configured recipients.
              </p>
            </div>
            <div>
              <SendPendingDigestButton buttonVariant="default" buttonSize="sm" />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

