import Link from "next/link";
import { getMyReferralCounts } from "@/action/referral.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function UserDashboardPage() {
  const { total, bh } = await getMyReferralCounts();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">My Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Referrals Submitted</CardTitle>
            <CardDescription className="text-sm">All referral submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total referrals you've submitted</p>
              </div>
              <div>
                <Link href="/user/referrals">
                  <Button variant="outline">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>B.H. Referrals Submitted</CardTitle>
            <CardDescription className="text-sm">Behavioral Health referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{bh}</p>
                <p className="text-sm text-muted-foreground">Behavioral Health referrals you've submitted</p>
              </div>
              <div>
                <Link href="/user/bhreferrals">
                  <Button variant="outline">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
