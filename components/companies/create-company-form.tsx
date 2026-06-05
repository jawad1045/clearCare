"use client";

import { useTransition } from "react";

import { createCompany } from "@/action/company.action";

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

export function CreateCompanyForm() {
  const [isPending, startTransition] =
    useTransition();

  async function handleSubmit(
    formData: FormData
  ) {
    startTransition(async () => {
      await createCompany(
        formData
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Create Company
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          action={handleSubmit}
          className="grid gap-4"
        >
          <Input
            name="organization"
            placeholder="Organization"
            required
          />

          <Input
            name="street"
            placeholder="Street"
          />

          <Input
            name="city"
            placeholder="City"
            required
          />

          <Input
            name="state"
            placeholder="State"
            required
          />

          <Input
            name="zip"
            placeholder="Zip"
          />

          <Input
            name="firstName"
            placeholder="Contact First Name"
            required
          />

          <Input
            name="lastName"
            placeholder="Contact Last Name"
            required
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
          />

          <Input
            name="phone"
            placeholder="Phone"
            required
          />

          <Input
            name="title"
            placeholder="Title"
          />

          <Textarea
            name="notes"
            placeholder="Notes"
          />

          <Button
            disabled={isPending}
          >
            Create Company
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}