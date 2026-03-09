import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getStudents,
  getRiskStudents,
  getStudentGPA,
  Student,
  RiskStudent,
  GPAResponse,
} from "@/services/api";

const GPADistributionChart = dynamic(
  () => import("@/components/GPADistributionChart"),
  { ssr: false }
);

const GPATrendChart = dynamic(() => import("@/components/GPATrendChart"), {
  ssr: false,
});

interface StudentGPAEntry {
  student: Student;
  gpa: number | null;
}

function gpaColor(gpa: number | null): string {
  if (gpa === null) return "text-gray-400";
  if (gpa >= 3.7) return "text-green-600";
  if (gpa >= 3.0) return "text-yellow-600";
  return "text-red-600";
}

export default function Dashboard() {
  const [studentGPAs, setStudentGPAs] = useState<StudentGPAEntry[]>([]);
  const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
  const [allGPAData, setAllGPAData] = useState<GPAResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [students, risks] = await Promise.all([
          getStudents(),
          getRiskStudents(),
        ]);
        setRiskStudents(risks);

        const gpaResults = await Promise.all(
          students.map((s) =>
            getStudentGPA(s.id).catch(() => null)
          )
        );

        const entries: StudentGPAEntry[] = students.map((s, i) => ({
          student: s,
          gpa: gpaResults[i]?.current_gpa ?? null,
        }));
        setStudentGPAs(entries);
        setAllGPAData(gpaResults.filter(Boolean) as GPAResponse[]);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const validGPAs = studentGPAs.filter((e) => e.gpa !== null).map((e) => e.gpa as number);
  const classAvg = validGPAs.length
    ? validGPAs.reduce((a, b) => a + b, 0) / validGPAs.length
    : null;
  const highestGPA = validGPAs.length ? Math.max(...validGPAs) : null;
  const lowestGPA = validGPAs.length ? Math.min(...validGPAs) : null;

  const highCount = validGPAs.filter((g) => g >= 3.7).length;
  const mediumCount = validGPAs.filter((g) => g >= 3.0 && g < 3.7).length;
  const lowCount = validGPAs.filter((g) => g < 3.0).length;

  const riskOnly = riskStudents.filter((r) => r.risk);

  // Merge all GPA histories into one multi-student trend chart dataset
  const allDates = Array.from(
    new Set(
      allGPAData.flatMap((d) => d.gpa_history.map((h) => h.assessment_date))
    )
  ).sort();

  const multiTrendData = allDates.map((date) => {
    const point: Record<string, string | number> = { date };
    allGPAData.forEach((d) => {
      const match = d.gpa_history.find((h) => h.assessment_date === date);
      if (match) point[d.student_name] = match.gpa;
    });
    return point;
  });

  const studentNames = allGPAData.map((d) => d.student_name);
  const COLORS = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#84CC16",
    "#A855F7", "#6366F1",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | GPA Tracker</title>
      </Head>

      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Class Avg GPA</p>
            <p className={`text-3xl font-bold ${gpaColor(classAvg)}`}>
              {classAvg !== null ? classAvg.toFixed(2) : "—"}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Highest GPA</p>
            <p className="text-3xl font-bold text-green-600">
              {highestGPA !== null ? highestGPA.toFixed(2) : "—"}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lowest GPA</p>
            <p className="text-3xl font-bold text-red-600">
              {lowestGPA !== null ? lowestGPA.toFixed(2) : "—"}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Students</p>
            <p className="text-3xl font-bold text-orange-600">{riskOnly.length}</p>
          </div>
        </div>

        {/* Risk Students Alert */}
        {riskOnly.length > 0 && (
          <div className="card border-l-4 border-red-500">
            <h2 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <span>⚠️</span> At-Risk Students (3 Consecutive GPA Declines)
            </h2>
            <div className="flex flex-wrap gap-2">
              {riskOnly.map((s) => (
                <Link
                  key={s.student_id}
                  href={`/students/${s.student_id}`}
                  className="badge-risk hover:bg-red-200 transition-colors cursor-pointer"
                >
                  {s.name}
                  {s.current_gpa !== null && ` (${s.current_gpa.toFixed(2)})`}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GPA Distribution */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">GPA Distribution</h2>
            <div className="flex gap-4 mb-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                High ≥ 3.7: <strong>{highCount}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                Medium 3.0–3.69: <strong>{mediumCount}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                Low &lt; 3.0: <strong>{lowCount}</strong>
              </span>
            </div>
            <GPADistributionChart high={highCount} medium={mediumCount} low={lowCount} />
          </div>

          {/* Class GPA Trends */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Class GPA Trends</h2>
            {multiTrendData.length > 0 ? (
              <div className="overflow-hidden">
                <DynamicMultiLineChart
                  data={multiTrendData}
                  studentNames={studentNames}
                  colors={COLORS}
                />
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No GPA data available yet.</p>
            )}
          </div>
        </div>

        {/* Quick Student Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Student Overview</h2>
            <Link href="/students" className="text-blue-600 text-sm hover:underline">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 font-medium text-gray-500">Name</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Current GPA</th>
                  <th className="pb-2 font-medium text-gray-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentGPAs.map(({ student, gpa }) => {
                  const risk = riskStudents.find(
                    (r) => r.student_id === student.id && r.risk
                  );
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2">
                        <Link
                          href={`/students/${student.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {student.name}
                        </Link>
                      </td>
                      <td className={`py-2 text-right font-semibold ${gpaColor(gpa)}`}>
                        {gpa !== null ? gpa.toFixed(2) : "—"}
                      </td>
                      <td className="py-2 text-center">
                        {risk ? (
                          <span className="badge-risk">⚠ Risk</span>
                        ) : (
                          <span className="badge-safe">✓ OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// Multi-line chart component for class trends
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DynamicMultiLineChart({
  data,
  studentNames,
  colors,
}: {
  data: Record<string, string | number>[];
  studentNames: string[];
  colors: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 4.5]} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => v?.toFixed(2)} />
        {studentNames.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={colors[i % colors.length]}
            strokeWidth={1.5}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
