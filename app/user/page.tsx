import Link from "next/link";
import { getMyReferralCounts, getMyReferralStatusCounts } from "@/action/referral.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { StatusPieChart } from "@/components/charts/status-pie-chart";

export default async function UserDashboardPage() {
  const [{ total, bh }, statusCounts] = await Promise.all([
    getMyReferralCounts(),
    getMyReferralStatusCounts(),
  ]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">My Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Referrals Submitted</CardTitle>
            <CardDescription className="text-sm">All referral submissions</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total referrals you've submitted</p>
              </div>
              <Link href="/user/referrals">
                <Button variant="outline">
                  View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>B.H. Referrals Submitted</CardTitle>
            <CardDescription className="text-sm">Behavioral Health referrals</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{bh}</p>
                <p className="text-sm text-muted-foreground">Behavioral Health referrals you've submitted</p>
              </div>
              <Link href="/user/bhreferrals">
                <Button variant="outline">
                  View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>My Referrals by Status</CardTitle>
          <CardDescription className="text-sm">Breakdown of all your referral statuses</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 h-72">
          <StatusPieChart data={statusCounts} />
        </CardContent>
      </Card>
    </div>
  );
}
