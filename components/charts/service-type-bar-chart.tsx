"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "@/locale/use-translation";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface Props {
  data: { label: string; count: number }[];
}

export function ServiceTypeBarChart({ data }: Props) {
  const { t } = useTranslation();
  const labels = data.map((d) => d.label);
  const counts = data.map((d) => d.count);
  const colors = data.map((_, i) => COLORS[i % COLORS.length]);

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
      padding: { top: 24 },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        offset: 4,
        clamp: true,
        color: "#007A7D",
        font: { weight: "bold" as const, size: 12 },
        formatter: (value: number) => (value === 0 ? "" : value),
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
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
        {t("charts.noDataYet")}
      </div>
    );
  }

  return <Bar data={chartData} options={options} />;
}
