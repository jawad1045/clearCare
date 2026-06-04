"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createUser } from "@/action/user.action";

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
import { Eye, EyeOff } from "lucide-react";

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
};

type CreateUserFormProps = {
  companies: Company[];
};

export function CreateUserForm({
  companies,
}: CreateUserFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<Company | null>(null);

  async function handleSubmit(
    formData: FormData
  ) {
    startTransition(async () => {
      await createUser(formData);

      router.push("/admin/users");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Create User
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          action={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Company */}
            <div className="space-y-2 md:col-span-2">
              <Label>
                Organization
              </Label>

              <Select
                onValueChange={(value) => {
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
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>

                <SelectContent>
                  {companies.map(
                    (company) => (
                      <SelectItem
                        key={company.id}
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

            {/* Readonly Address */}
            <div className="space-y-2">
              <Label>Street</Label>

              <Input
                value={
                  selectedCompany?.street ??
                  ""
                }
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>City</Label>

              <Input
                value={
                  selectedCompany?.city ??
                  ""
                }
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>State</Label>

              <Input
                value={
                  selectedCompany?.state ??
                  ""
                }
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>Zip</Label>

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
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                type="email"
                name="email"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Phone</Label>

              <Input
                name="phone"
                required
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>

              <Input
                name="title"
                placeholder="Manager"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>

              <Select
                name="role"
                defaultValue="User"
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

            {/* Password */}
            <div className="space-y-2">
              <Label>
                Password
              </Label>

              <div className="relative">
                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  required
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>
                Confirm Password
              </Label>

              <div className="relative">
                <Input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  required
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending
              ? "Creating..."
              : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}