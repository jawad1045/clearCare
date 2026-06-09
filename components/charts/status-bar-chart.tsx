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
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Reviewing: "#3b82f6",
  Approved: "#22c55e",
  Rejected: "#ef4444",
  Completed: "#8b5cf6",
};

function colorFor(status: string) {
  return STATUS_COLORS[status] ?? "#8b5cf6";
}

interface Props {
  data: { status: string; count: number }[];
}

export function StatusBarChart({ data }: Props) {
  const labels = data.map((d) => d.status);
  const counts = data.map((d) => d.count);
  const colors = labels.map(colorFor);

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
