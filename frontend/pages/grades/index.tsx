import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import {
  getStudents,
  getCourses,
  getAssessments,
  getGrades,
  createOrUpdateGrade,
  Student,
  Course,
  Assessment,
  Grade,
} from "@/services/api";

const GRADE_LETTERS = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "NA"];

function gradeColor(letter: string): string {
  if (["A+", "A"].includes(letter)) return "bg-green-100 text-green-800";
  if (["B+", "B"].includes(letter)) return "bg-blue-100 text-blue-800";
  if (["C+", "C"].includes(letter)) return "bg-yellow-100 text-yellow-800";
  if (["D+", "D"].includes(letter)) return "bg-orange-100 text-orange-800";
  if (letter === "F") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-500";
}

export default function GradeEntry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, c, a] = await Promise.all([
          getStudents(),
          getCourses(),
          getAssessments(),
        ]);
        setStudents(s);
        setCourses(c);
        setAssessments(a);
        if (s.length > 0) setSelectedStudent(s[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudent === null) return;
    getGrades(selectedStudent).then(setGrades).catch(console.error);
  }, [selectedStudent]);

  const getGrade = useCallback(
    (courseId: number, assessmentId: number): string => {
      const g = grades.find(
        (gr) => gr.course_id === courseId && gr.assessment_id === assessmentId
      );
      return g?.grade_letter ?? "";
    },
    [grades]
  );

  const handleGradeChange = async (
    courseId: number,
    assessmentId: number,
    gradeLetter: string
  ) => {
    if (!selectedStudent || !gradeLetter) return;
    const key = `${courseId}-${assessmentId}`;
    setSaving(key);
    try {
      const saved = await createOrUpdateGrade({
        student_id: selectedStudent,
        course_id: courseId,
        assessment_id: assessmentId,
        grade_letter: gradeLetter,
      });
      setGrades((prev) => {
        const existing = prev.findIndex(
          (g) =>
            g.course_id === courseId &&
            g.assessment_id === assessmentId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = saved;
          return updated;
        }
        return [...prev, saved];
      });
      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error("Failed to save grade", err);
      setSaveMessage("Error saving grade");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading grade entry form...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Grade Entry | GPA Tracker</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Grade Entry</h1>
          {saveMessage && (
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                saveMessage.startsWith("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {saveMessage}
            </span>
          )}
        </div>

        {/* Student Selector */}
        <div className="card flex items-center gap-4">
          <label className="font-medium text-gray-700 whitespace-nowrap">
            Select Student:
          </label>
          <select
            value={selectedStudent ?? ""}
            onChange={(e) => setSelectedStudent(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Table */}
        {selectedStudent && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[120px]">
                      Course
                    </th>
                    <th className="text-center px-2 py-3 font-medium text-gray-600 text-xs">
                      Wt
                    </th>
                    {assessments.map((a) => (
                      <th
                        key={a.id}
                        className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap min-w-[120px]"
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
                        const currentGrade = getGrade(c.id, a.id);
                        const key = `${c.id}-${a.id}`;
                        const isSaving = saving === key;
                        return (
                          <td key={a.id} className="px-2 py-2 text-center">
                            <div className="relative">
                              <select
                                value={currentGrade}
                                onChange={(e) =>
                                  handleGradeChange(c.id, a.id, e.target.value)
                                }
                                disabled={isSaving}
                                className={`w-full text-center text-xs font-semibold rounded-lg px-2 py-1.5 border
                                  focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer
                                  transition-colors disabled:opacity-50
                                  ${currentGrade ? gradeColor(currentGrade) + " border-transparent" : "border-gray-200 text-gray-400"}
                                `}
                              >
                                <option value="">—</option>
                                {GRADE_LETTERS.map((g) => (
                                  <option key={g} value={g}>
                                    {g}
                                  </option>
                                ))}
                              </select>
                              {isSaving && (
                                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-500 text-xs">
                                  ⟳
                                </span>
                              )}
                            </div>
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

        <p className="text-xs text-gray-400">
          Changes are saved automatically when you select a grade.
        </p>
      </div>
    </>
  );
}
