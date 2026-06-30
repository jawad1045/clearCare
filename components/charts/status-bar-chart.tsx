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

function statusOrder(status: string): number {
  const index = REFERRAL_STATUSES.indexOf(status as ReferralStatus);
  return index === -1 ? REFERRAL_STATUSES.length : index;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface Props {
  data: { status: string; count: number }[];
}

export function StatusBarChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
  const labels = sorted.map((d) => getStatusLabel(d.status));
  const counts = sorted.map((d) => d.count);
  const colors = sorted.map((d) => getStatusColor(d.status));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Referrals",
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
      padding: { top: 24 },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        offset: 4,
        clamp: true,
        color: "#94a3b8",
        font: { weight: "bold" as const, size: 12 },
        formatter: (value: number) => (value === 0 ? "" : value),
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
        No referrals yet
      </div>
    );
  }

  return <Bar data={chartData} options={options} />;
}
