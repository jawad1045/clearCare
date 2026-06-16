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
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface Props {
  data: { status: string; count: number }[];
}

export function StatusBarChart({ data }: Props) {
  const labels = data.map((d) => getStatusLabel(d.status));
  const counts = data.map((d) => d.count);
  const colors = labels.map(getStatusColor);

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
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: "#ffffff",
        font: { weight: "bold" as const, size: 13 },
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

  return <Bar data={chartData} options={options} />;
}
