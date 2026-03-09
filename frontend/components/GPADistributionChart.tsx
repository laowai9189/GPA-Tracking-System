import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface GPADistributionChartProps {
  high: number;
  medium: number;
  low: number;
}

const data = (high: number, medium: number, low: number) => [
  { name: "High (≥ 3.7)", count: high, fill: "#10B981" },
  { name: "Medium (3.0–3.69)", count: medium, fill: "#F59E0B" },
  { name: "Low (< 3.0)", count: low, fill: "#EF4444" },
];

export default function GPADistributionChart({
  high,
  medium,
  low,
}: GPADistributionChartProps) {
  const chartData = data(high, medium, low);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
