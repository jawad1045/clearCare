"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { REFERRAL_STATUSES, ReferralStatus, getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { useTranslation } from "@/locale/use-translation";

function statusOrder(status: string): number {
  const index = REFERRAL_STATUSES.indexOf(status as ReferralStatus);
  return index === -1 ? REFERRAL_STATUSES.length : index;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface Props {
  data: { status: string; count: number }[];
}

export function StatusBarChart({ data }: Props) {
  const { t, locale } = useTranslation();
  const sorted = [...data].sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
  const labels = sorted.map((d) => getStatusLabel(d.status, locale));
  const counts = sorted.map((d) => d.count);
  const colors = sorted.map((d) => getStatusColor(d.status));
  const total = counts.reduce((sum, n) => sum + n, 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: t("charts.datasetLabelReferrals"),
        data: counts,
        backgroundColor: colors.map((c) => c + "cc"),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    layout: {
      padding: { top: 32 },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        offset: 4,
        clamp: true,
        color: "#007A7D",
        font: { weight: 900 as const, size: 13 },
        formatter: (value: number) => {
          if (value === 0) return "";
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${value} (${pct}%)`;
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import("chart.js").TooltipItem<"bar">) => {
            const value = ctx.parsed.y ?? 0;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return ` ${t("charts.tooltipReferrals", { value, pct })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#94a3b8", stepSize: 1 },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t("charts.noReferralsYet")}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-end">
        <span className="text-xs font-extrabold text-brand">{t("charts.totalReferrals")}</span>
        <span className="text-xl font-extrabold pr-6 text-brand">{total}</span>
      </div>
      <div className="min-h-0 flex-1">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
