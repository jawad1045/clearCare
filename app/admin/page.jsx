import Link from "next/link";
import { getUsersCount } from "@/action/user.action";
import { getCompaniesCount } from "@/action/company.action";
import { getReferralsCount, getBHReferralsCount } from "@/action/referral.action";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Users,
  Building2,
  Receipt,
  Brain,
  ArrowRight,
} from "lucide-react";

export default async function AdminPage() {
  const [totalUsers, totalCompanies, totalReferrals, totalBHReferrals] =
    await Promise.all([
      getUsersCount(),
      getCompaniesCount(),
      getReferralsCount(),
      getBHReferralsCount(),
    ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">System overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </div>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold">{totalCompanies}</div>
              <p className="text-xs text-muted-foreground">Registered companies</p>
            </div>
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Referrals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold">{totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Total referrals</p>
            </div>
            <Link href="/admin/referrals">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* B.H. Referrals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">B.H. Referrals</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold">{totalBHReferrals}</div>
              <p className="text-xs text-muted-foreground">Behavioral Health referrals</p>
            </div>
            <Link href="/admin/bhreferrals">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
