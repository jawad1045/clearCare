import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  basePath: string;
  title?: string;
  subtitle?: string;
  showCreate?: boolean;
  total?: number;
};

export function ReferralHeader({ basePath, title = "Referrals", subtitle, showCreate = true, total }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-brand">{title}</h1>
        <p className="text-muted-foreground">{subtitle ?? `Manage ${title.toLowerCase()}`}</p>
      </div>

      <div className="text-center">
        <span className="text-sm font-medium text-brand">Total {title}</span>
        <p className="text-2xl font-bold text-brand">{total ?? 0}</p>
      </div>

      <div>
        {showCreate ? (
          <Link href={`${basePath}/create`}>
            <Button className="px-6 py-5">
              <Plus className="mr-2 h-4 w-4" />
              Create {title}
            </Button>
          </Link>
        ) : (
          <div className="w-32" />
        )}
      </div>
    </div>
  );
}
