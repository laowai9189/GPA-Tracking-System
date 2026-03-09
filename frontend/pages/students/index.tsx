import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  getStudents,
  getStudentGPA,
  getRiskStudents,
  Student,
  RiskStudent,
} from "@/services/api";

interface StudentRow {
  student: Student;
  currentGPA: number | null;
  previousGPA: number | null;
  isRisk: boolean;
}

function gpaColor(gpa: number | null): string {
  if (gpa === null) return "text-gray-400";
  if (gpa >= 3.7) return "text-green-600";
  if (gpa >= 3.0) return "text-yellow-600";
  return "text-red-600";
}

function changeIndicator(current: number | null, previous: number | null) {
  if (current === null || previous === null) return { text: "—", cls: "text-gray-400" };
  const diff = current - previous;
  if (diff > 0) return { text: `▲ +${diff.toFixed(2)}`, cls: "text-green-600" };
  if (diff < 0) return { text: `▼ ${diff.toFixed(2)}`, cls: "text-red-600" };
  return { text: "→ 0.00", cls: "text-gray-500" };
}

export default function StudentList() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [students, riskData] = await Promise.all([
          getStudents(),
          getRiskStudents(),
        ]);
        const riskMap = new Map<number, boolean>(
          riskData.map((r) => [r.student_id, r.risk])
        );

        const gpaResults = await Promise.all(
          students.map((s) => getStudentGPA(s.id).catch(() => null))
        );

        const result: StudentRow[] = students.map((s, i) => {
          const history = gpaResults[i]?.gpa_history ?? [];
          const current = history.length > 0 ? history[history.length - 1].gpa : null;
          const previous = history.length > 1 ? history[history.length - 2].gpa : null;
          return {
            student: s,
            currentGPA: current,
            previousGPA: previous,
            isRisk: riskMap.get(s.id) ?? false,
          };
        });
        setRows(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Students | GPA Tracker</title>
      </Head>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <span className="text-sm text-gray-500">{rows.length} students</span>
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Name</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">
                  Current GPA
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">
                  Previous GPA
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Change</th>
                <th className="text-center px-6 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ student, currentGPA, previousGPA, isRisk }) => {
                const change = changeIndicator(currentGPA, previousGPA);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {student.name}
                      </Link>
                    </td>
                    <td
                      className={`px-6 py-3 text-right font-semibold ${gpaColor(
                        currentGPA
                      )}`}
                    >
                      {currentGPA !== null ? currentGPA.toFixed(2) : "—"}
                    </td>
                    <td
                      className={`px-6 py-3 text-right ${gpaColor(previousGPA)}`}
                    >
                      {previousGPA !== null ? previousGPA.toFixed(2) : "—"}
                    </td>
                    <td className={`px-6 py-3 text-right font-medium ${change.cls}`}>
                      {change.text}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {isRisk ? (
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
    </>
  );
}
