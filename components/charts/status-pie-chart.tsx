"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

import { getStatusColor } from "@/lib/referral-statuses";

function colorFor(status: string) {
  return getStatusColor(status);
}

interface Props {
  data: { status: string; count: number }[];
}

export function StatusPieChart({ data }: Props) {
  const labels = data.map((d) => d.status);
  const counts = data.map((d) => d.count);
  const colors = labels.map(colorFor);

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
        No referrals yet
      </div>
    );
  }

  return <Pie data={chartData} options={options} />;
}
