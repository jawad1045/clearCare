"use client";

import { useState, useTransition } from "react";

import { updateUser } from "@/action/user.action";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
};

type User = {
  id: number;
  acctId: number;

  organization: string;

  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string | null;

  userRole: string;
  isActive: boolean;
};

type Props = {
  user: User;
  companies: Company[];
};

export function EditUserForm({
  user,
  companies,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  const [selectedCompany, setSelectedCompany] =
    useState(
      companies.find(
        (c) => c.id === user.acctId
      ) || null
    );

  const [isActive, setIsActive] =
    useState(user.isActive);

  async function handleSubmit(
    formData: FormData
  ) {
    formData.set(
      "isActive",
      String(isActive)
    );

    startTransition(async () => {
      await updateUser(
        user.id,
        formData
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Edit User
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

              <Select
                defaultValue={String(
                  user.acctId
                )}
                onValueChange={(
                  value
                ) => {
                  const company =
                    companies.find(
                      (c) =>
                        c.id ===
                        Number(value)
                    ) || null;

                  setSelectedCompany(
                    company
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {companies.map(
                    (company) => (
                      <SelectItem
                        key={
                          company.id
                        }
                        value={String(
                          company.id
                        )}
                      >
                        {
                          company.organization
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <input
                type="hidden"
                name="acctId"
                value={
                  selectedCompany?.id ||
                  ""
                }
              />
            </div>

            {/* Address */}

            <div className="space-y-2">
              <Label>
                Street
              </Label>

              <Input
                value={
                  selectedCompany?.street ??
                  ""
                }
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>
                City
              </Label>

              <Input
                value={
                  selectedCompany?.city ??
                  ""
                }
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>
                State
              </Label>

              <Input
                value={
                  selectedCompany?.state ??
                  ""
                }
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>
                Zip
              </Label>

              <Input
                value={
                  selectedCompany?.zip ??
                  ""
                }
                readOnly
              />
            </div>

            {/* First Name */}

            <div className="space-y-2">
              <Label>
                First Name
              </Label>

              <Input
                name="firstName"
                defaultValue={
                  user.contactFirstName
                }
                required
              />
            </div>

            {/* Last Name */}

            <div className="space-y-2">
              <Label>
                Last Name
              </Label>

              <Input
                name="lastName"
                defaultValue={
                  user.contactLastName
                }
                required
              />
            </div>

            {/* Email */}

            <div className="space-y-2">
              <Label>
                Email
              </Label>

              <Input
                type="email"
                name="email"
                defaultValue={
                  user.contactEmail
                }
                required
              />
            </div>

            {/* Phone */}

            <div className="space-y-2">
              <Label>
                Phone
              </Label>

              <Input
                name="phone"
                defaultValue={
                  user.contactPhone
                }
                required
              />
            </div>

            {/* Title */}

            <div className="space-y-2">
              <Label>
                Title
              </Label>

              <Input
                name="title"
                defaultValue={
                  user.contactTitle ??
                  ""
                }
              />
            </div>

            {/* Role */}

            <div className="space-y-2">
              <Label>
                Role
              </Label>

              <Select
                name="role"
                defaultValue={
                  user.userRole
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Admin">
                    Admin
                  </SelectItem>

                  <SelectItem value="User">
                    User
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active */}

            <div className="space-y-2">
              <Label>
                Active
              </Label>

              <div className="flex h-10 items-center">
                <Switch
                  checked={
                    isActive
                  }
                  onCheckedChange={
                    setIsActive
                  }
                />
              </div>
            </div>

          </div>

          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}