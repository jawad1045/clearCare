import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  basePath: string;
  title?: string;
  showCreate?: boolean;
};

export function ReferralHeader({ basePath, title = "Referrals", showCreate = true }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">Manage {title.toLowerCase()}</p>
      </div>
      {showCreate && (
        <Link href={`${basePath}/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create {title}
          </Button>
        </Link>
      )}
    </div>
  );
}