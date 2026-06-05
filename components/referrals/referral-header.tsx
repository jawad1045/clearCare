import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  basePath: string;
};

export function ReferralHeader({
  basePath,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Referrals
        </h1>

        <p className="text-muted-foreground">
          Manage referrals
        </p>
      </div>

      <Link
        href={`${basePath}/create`}
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Referral
        </Button>
      </Link>
    </div>
  );
}