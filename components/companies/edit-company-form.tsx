"use client";

import { useTransition } from "react";

import { updateCompany } from "@/action/company.action";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
  contactPhone: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactTitle: string | null;
  notes: string | null;
};

type Props = {
  company: Company;
};

export function EditCompanyForm({
  company,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  async function handleSubmit(
    formData: FormData
  ) {
    startTransition(async () => {
      await updateCompany(
        company.id,
        formData
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Edit Company
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          action={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Organization */}

            <div className="space-y-2 md:col-span-2">
              <Label>
                Organization
              </Label>

              <Input
                name="organization"
                defaultValue={
                  company.organization
                }
                required
              />
            </div>

            {/* Address */}

            <div className="space-y-2 md:col-span-2">
              <Label>
                Street
              </Label>

              <Input
                name="street"
                defaultValue={
                  company.street ??
                  ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label>City</Label>

              <Input
                name="city"
                defaultValue={
                  company.city
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>State</Label>

              <Input
                name="state"
                defaultValue={
                  company.state
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Zip</Label>

              <Input
                name="zip"
                defaultValue={
                  company.zip ??
                  ""
                }
              />
            </div>

            {/* Contact */}

            <div className="space-y-2">
              <Label>
                Contact First Name
              </Label>

              <Input
                name="firstName"
                defaultValue={
                  company.contactFirstName
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Contact Last Name
              </Label>

              <Input
                name="lastName"
                defaultValue={
                  company.contactLastName
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                type="email"
                name="email"
                defaultValue={
                  company.contactEmail
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>

              <Input
                name="phone"
                defaultValue={
                  company.contactPhone
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Title</Label>

              <Input
                name="title"
                defaultValue={
                  company.contactTitle ??
                  ""
                }
              />
            </div>

            {/* Notes */}

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>

              <Textarea
                name="notes"
                defaultValue={
                  company.notes ??
                  ""
                }
                rows={5}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}