"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { X } from "lucide-react";

import { createReferral } from "@/action/referral.action";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UploadButton } from "@/lib/utils/uploadthing";
import { toast } from "sonner";

const SERVICE_TYPES = [
  "Drug Test",
  "Physical",
  "Behavioral Health",
  "Medication Management",
  "IOP",
];

const REFERRAL_TYPES = [
  "Random",
  "Pre-employment",
  "Post-accident",
  "Reasonable Suspicion",
];

const PRIORITIES = [
  "Same-day",
  "24-hours",
];

const GENDERS = [
  "Male",
  "Female",
  "Other",
];

export function CreateReferralForm() {
  const [isPending, startTransition] =
    useTransition();

  const [attachments, setAttachments] =
    useState<string[]>([]);

  async function handleSubmit(
    formData: FormData
  ) {
    startTransition(async () => {
      try {
        await createReferral(
          formData
        );
      } catch (error) {
        toast.error(
          "Failed to create referral"
        );
      }
    });
  }

  function removeAttachment(
    url: string
  ) {
    setAttachments((prev) =>
      prev.filter(
        (item) => item !== url
      )
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Create Referral
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          action={handleSubmit}
          className="space-y-8"
        >
          {/* Hidden uploaded URLs */}
          {attachments.map((url) => (
            <input
              key={url}
              type="hidden"
              name="attachments"
              value={url}
            />
          ))}

          {/* Service Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Service Information
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>
                  Service Type
                </Label>

                <Select
                  name="serviceType"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>

                  <SelectContent>
                    {SERVICE_TYPES.map(
                      (service) => (
                        <SelectItem
                          key={service}
                          value={
                            service
                          }
                        >
                          {service}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>

                <Select name="type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>

                  <SelectContent>
                    {REFERRAL_TYPES.map(
                      (type) => (
                        <SelectItem
                          key={type}
                          value={
                            type
                          }
                        >
                          {type}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Priority
                </Label>

                <Select
                  name="priority"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>

                  <SelectContent>
                    {PRIORITIES.map(
                      (
                        priority
                      ) => (
                        <SelectItem
                          key={
                            priority
                          }
                          value={
                            priority
                          }
                        >
                          {priority}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Parent Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                name="parentFirstName"
                placeholder="Parent First Name"
              />

              <Input
                name="parentLastName"
                placeholder="Parent Last Name"
              />

              <Input
                type="email"
                name="parentEmail"
                placeholder="Parent Email"
              />

              <Input
                name="parentPhone"
                placeholder="Parent Phone"
              />
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Patient Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                name="patientFirstName"
                placeholder="Patient First Name"
                required
              />

              <Input
                name="patientLastName"
                placeholder="Patient Last Name"
                required
              />

              <Input
                type="date"
                name="dob"
                required
              />

              <Input
                name="grade"
                placeholder="Grade"
                required
              />

              <Input
                name="race"
                placeholder="Race"
                required
              />

              <div>
                <Label>
                  Gender
                </Label>

                <Select
                  name="gender"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>

                  <SelectContent>
                    {GENDERS.map(
                      (
                        gender
                      ) => (
                        <SelectItem
                          key={
                            gender
                          }
                          value={
                            gender
                          }
                        >
                          {gender}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Input
                name="ssn"
                placeholder="SSN"
                required
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Attachments
            </h3>

            <UploadButton
              endpoint="imageUploader"
              appearance={{
                button:
                  "bg-primary text-primary-foreground rounded-md px-4 py-2",
                container:
                  "w-fit",
                allowedContent:
                  "hidden",
              }}
              content={{
                button() {
                  return "Upload Files";
                },
              }}
              onClientUploadComplete={(
                res
              ) => {
                const urls =
                  res.map(
                    (file) =>
                      file.ufsUrl
                  );

                setAttachments(
                  (
                    prev
                  ) => [
                    ...prev,
                    ...urls,
                  ]
                );

                toast.success(
                  "Files uploaded successfully"
                );
              }}
              onUploadError={(
                error
              ) => {
                toast.error(
                  error.message
                );
              }}
            />

            {attachments.length >
              0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {attachments.map(
                  (url) => (
                    <div
                      key={
                        url
                      }
                      className="relative overflow-hidden rounded-lg border"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          removeAttachment(
                            url
                          )
                        }
                        className="absolute right-2 top-2 z-10 rounded-full bg-background p-1 shadow"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <Image
                        src={url}
                        alt="Attachment"
                        width={
                          300
                        }
                        height={
                          300
                        }
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>
              Notes
            </Label>

            <Textarea
              name="notes"
              rows={5}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending
              ? "Creating..."
              : "Create Referral"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}