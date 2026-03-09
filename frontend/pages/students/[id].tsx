import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getStudentGPA,
  getGrades,
  getCourses,
  getAssessments,
  getRiskStudents,
  GPAResponse,
  Grade,
  Course,
  Assessment,
  RiskStudent,
} from "@/services/api";

const GPATrendChart = dynamic(() => import("@/components/GPATrendChart"), { ssr: false });

const GRADE_LETTERS = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "NA"];

export default function StudentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const studentId = id ? parseInt(id as string, 10) : null;

  const [gpaData, setGpaData] = useState<GPAResponse | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [riskInfo, setRiskInfo] = useState<RiskStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    async function loadData() {
      try {
        const [gpa, studentGrades, allCourses, allAssessments, riskStudents] =
          await Promise.all([
            getStudentGPA(studentId!),
            getGrades(studentId!),
            getCourses(),
            getAssessments(),
            getRiskStudents(),
          ]);
        setGpaData(gpa);
        setGrades(studentGrades);
        setCourses(allCourses);
        setAssessments(allAssessments);
        const risk = riskStudents.find((r) => r.student_id === studentId);
        setRiskInfo(risk ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  function getGrade(courseId: number, assessmentId: number): Grade | undefined {
    return grades.find(
      (g) => g.course_id === courseId && g.assessment_id === assessmentId
    );
  }

  function gradeColor(letter: string): string {
    if (["A+", "A"].includes(letter)) return "bg-green-100 text-green-800";
    if (["B+", "B"].includes(letter)) return "bg-blue-100 text-blue-800";
    if (["C+", "C"].includes(letter)) return "bg-yellow-100 text-yellow-800";
    if (["D+", "D"].includes(letter)) return "bg-orange-100 text-orange-800";
    if (letter === "F") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-500";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading student data...</div>
      </div>
    );
  }

  if (!gpaData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found.</p>
        <Link href="/students" className="btn-primary mt-4 inline-block">
          Back to Students
        </Link>
      </div>
    );
  }

  const currentGPA = gpaData.current_gpa;
  const gpaColor =
    currentGPA === null
      ? "text-gray-400"
      : currentGPA >= 3.7
      ? "text-green-600"
      : currentGPA >= 3.0
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <>
      <Head>
        <title>{gpaData.student_name} | GPA Tracker</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/students" className="btn-secondary text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{gpaData.student_name}</h1>
          {riskInfo?.risk ? (
            <span className="badge-risk text-sm">⚠ At Risk</span>
          ) : (
            <span className="badge-safe text-sm">✓ On Track</span>
          )}
        </div>

        {/* Profile + GPA Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current GPA</p>
            <p className={`text-4xl font-bold ${gpaColor}`}>
              {currentGPA !== null ? currentGPA.toFixed(2) : "—"}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Assessments Taken
            </p>
            <p className="text-4xl font-bold text-gray-700">
              {gpaData.gpa_history.length}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Status</p>
            <p className="text-2xl font-bold mt-2">
              {riskInfo?.risk ? (
                <span className="text-red-600">⚠ Risk</span>
              ) : (
                <span className="text-green-600">✓ Safe</span>
              )}
            </p>
          </div>
        </div>

        {/* GPA Trend Chart */}
        {gpaData.gpa_history.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">GPA Trend</h2>
            <GPATrendChart
              history={gpaData.gpa_history}
              studentName={gpaData.student_name}
            />
          </div>
        )}

        {/* GPA History Table */}
        {gpaData.gpa_history.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">GPA History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">
                      Assessment Date
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">GPA</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gpaData.gpa_history.map((h, i) => {
                    const prev =
                      i > 0 ? gpaData.gpa_history[i - 1].gpa : null;
                    const diff = prev !== null ? h.gpa - prev : null;
                    return (
                      <tr key={h.assessment_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700">{h.assessment_date}</td>
                        <td className="px-4 py-2 text-right font-semibold text-blue-700">
                          {h.gpa.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {diff === null ? (
                            "—"
                          ) : diff > 0 ? (
                            <span className="text-green-600">▲ +{diff.toFixed(2)}</span>
                          ) : diff < 0 ? (
                            <span className="text-red-600">▼ {diff.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-500">→ 0.00</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grades Table */}
        {courses.length > 0 && assessments.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Grade Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-600 sticky left-0 bg-gray-50">
                      Course
                    </th>
                    <th className="text-center px-2 py-2 font-medium text-gray-600 text-xs">
                      Wt
                    </th>
                    {assessments.map((a) => (
                      <th
                        key={a.id}
                        className="text-center px-4 py-2 font-medium text-gray-600 whitespace-nowrap"
                      >
                        {a.assessment_date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-800 sticky left-0 bg-white">
                        {c.name}
                      </td>
                      <td className="px-2 py-2 text-center text-xs text-gray-500">
                        {c.weight}
                      </td>
                      {assessments.map((a) => {
                        const g = getGrade(c.id, a.id);
                        const letter = g?.grade_letter ?? "—";
                        return (
                          <td key={a.id} className="px-4 py-2 text-center">
                            {g ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${gradeColor(
                                  letter
                                )}`}
                              >
                                {letter}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
