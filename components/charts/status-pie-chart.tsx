"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { useTranslation } from "@/locale/use-translation";

function colorFor(status: string) {
  return getStatusColor(status);
}

interface Props {
  data: { status: string; count: number }[];
}

export function StatusPieChart({ data }: Props) {
  const { t, locale } = useTranslation();
  const labels = data.map((d) => getStatusLabel(d.status, locale));
  const counts = data.map((d) => d.count);
  const colors = data.map((d) => colorFor(d.status));

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors.map((c) => c + "cc"),
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#94a3b8", padding: 16, boxWidth: 12 },
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

  return <Pie data={chartData} options={options} />;
}
