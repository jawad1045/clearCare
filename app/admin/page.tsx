import { Suspense } from "react";
import Link from "next/link";
import { getUsersCount } from "@/action/user.action";
import { getCompaniesCount } from "@/action/company.action";
import { getReferralsCount, getReferralStatusCounts, getRecentReferrals, getReferralsByServiceType, getTopCompaniesByReferrals } from "@/action/referral.action";
import { getBHReferralsCount, getBHReferralStatusCounts, getRecentBHReferrals } from "@/action/bh-referral.action";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import { StatusPieChart } from "@/components/charts/status-pie-chart";
import { ServiceTypeBarChart } from "@/components/charts/service-type-bar-chart";
import { MonthFilter } from "@/components/charts/month-filter";
import { getStatusBadge } from "@/lib/referral-statuses";

import {
  Users,
  Building2,
  Receipt,
  Brain,
  ArrowRight,
  Clock,
} from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; bhmonth?: string }>;
}) {
  const { month, bhmonth } = await searchParams;
  const [totalUsers, totalCompanies, totalReferrals, totalBHReferrals, statusCounts, bhStatusCounts, recentReferrals, recentBHReferrals, serviceTypeCounts, topCompanies] =
    await Promise.all([
      getUsersCount(),
      getCompaniesCount(),
      getReferralsCount(),
      getBHReferralsCount(),
      getReferralStatusCounts(month),
      getBHReferralStatusCounts(bhmonth),
      getRecentReferrals(),
      getRecentBHReferrals(),
      getReferralsByServiceType(),
      getTopCompaniesByReferrals(),
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

      {/* Charts */}
       <div className="flex gap-4">
        <Card className="w-[60%]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Referrals by Status</CardTitle>
            <Suspense>
              <MonthFilter />
            </Suspense>
          </CardHeader>
          <CardContent className="h-72">
            <StatusBarChart data={statusCounts} />
          </CardContent>
        </Card>

        <Card className="w-[40%]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">B.H. Referrals by Status</CardTitle>
            <Suspense>
              <MonthFilter paramKey="bhmonth" />
            </Suspense>
          </CardHeader>
          <CardContent className="h-72">
            <StatusPieChart data={bhStatusCounts} />
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="flex gap-4">
        {/* Service Type Breakdown */}
        <Card className="w-[50%]">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Referrals by Service Type</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ServiceTypeBarChart data={serviceTypeCounts} />
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card className="w-[50%]">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Companies by Referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCompanies.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}.</span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{c.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(c.count / topCompanies[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {topCompanies.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Referrals</CardTitle>
          <Link href="/admin/referrals">
            <Button variant="outline" size="sm">
              View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">Patient</th>
                <th className="pb-2 text-left font-medium">Company</th>
                <th className="pb-2 text-left font-medium">Service</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentReferrals.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 font-medium">{r.patientFirstName} {r.patientLastName}</td>
                  <td className="py-2 text-muted-foreground">{r.company.organization}</td>
                  <td className="py-2 text-muted-foreground">{r.serviceType}</td>
                  <td className="py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(r.dateOfReferral).toLocaleDateString()}
                  </td>
                  <td className="py-2 text-right">
                    <Link href={`/admin/referrals/${r.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {recentReferrals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground">No referrals yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {/* Recent BH Referrals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent B.H. Referrals</CardTitle>
          <Link href="/admin/bhreferrals">
            <Button variant="outline" size="sm">
              View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">Patient</th>
                <th className="pb-2 text-left font-medium">Company</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentBHReferrals.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 font-medium">{r.firstName} {r.lastName}</td>
                  <td className="py-2 text-muted-foreground">{r.company.organization}</td>
                  <td className="py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(r.dateOfReferral).toLocaleDateString()}
                  </td>
                  <td className="py-2 text-right">
                    <Link href={`/admin/bhreferrals/${r.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {recentBHReferrals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">No B.H. referrals yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
