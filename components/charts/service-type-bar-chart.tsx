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
  data: { label: string; bhCount: number; medCount: number }[];
  bhLabel: string;
  medLabel: string;
}

export function ServiceTypeBarChart({ data, bhLabel, medLabel }: Props) {
  const { t } = useTranslation();
  const labels = data.map((d) => d.label);
  const bhCounts = data.map((d) => d.bhCount);
  const medCounts = data.map((d) => d.medCount);

  const bhColor = "#007A7D"; 
  const medColor = "#8b5cf6"; 

  const chartData = {
    labels,
    datasets: [
      {
        label: bhLabel,
        data: bhCounts,
        backgroundColor: bhColor + "cc",
        borderColor: bhColor,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: medLabel,
        data: medCounts,
        backgroundColor: medColor + "cc",
        borderColor: medColor,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    layout: {
      padding: { top: 24 },
    },
    plugins: {
      legend: { 
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          color: "#64748b"
        }
      },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        offset: 2,
        clamp: true,
        color: "#64748b",
        font: { weight: "bold" as const, size: 10 },
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
