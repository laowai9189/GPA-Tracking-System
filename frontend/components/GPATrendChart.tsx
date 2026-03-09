import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GPAPoint } from "@/services/api";

interface GPATrendChartProps {
  history: GPAPoint[];
  studentName?: string;
}

export default function GPATrendChart({ history, studentName }: GPATrendChartProps) {
  const chartData = history.map((h) => ({
    date: h.assessment_date,
    GPA: h.gpa,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 4.5]} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => v.toFixed(2)} />
        <Legend />
        <Line
          type="monotone"
          dataKey="GPA"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
          name={studentName || "GPA"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
