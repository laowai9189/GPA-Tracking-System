import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ---- Types ----

export interface Student {
  id: number;
  name: string;
  created_at: string;
}

export interface Course {
  id: number;
  name: string;
  weight: number;
}

export interface Assessment {
  id: number;
  assessment_date: string;
}

export interface Grade {
  id: number;
  student_id: number;
  course_id: number;
  assessment_id: number;
  grade_letter: string;
  grade_value: number | null;
}

export interface GPAPoint {
  assessment_id: number;
  assessment_date: string;
  gpa: number;
}

export interface GPAResponse {
  student_id: number;
  student_name: string;
  current_gpa: number | null;
  gpa_history: GPAPoint[];
}

export interface RiskStudent {
  student_id: number;
  name: string;
  current_gpa: number | null;
  trend: (number | null)[];
  risk: boolean;
}

// ---- API calls ----

export const getStudents = () => api.get<Student[]>("/students").then((r) => r.data);
export const createStudent = (name: string) =>
  api.post<Student>("/students", { name }).then((r) => r.data);

export const getCourses = () => api.get<Course[]>("/courses").then((r) => r.data);

export const getAssessments = () =>
  api.get<Assessment[]>("/assessments").then((r) => r.data);
export const createAssessment = (assessment_date: string) =>
  api.post<Assessment>("/assessments", { assessment_date }).then((r) => r.data);

export const getGrades = (student_id?: number) => {
  const params = student_id !== undefined ? { student_id } : {};
  return api.get<Grade[]>("/grades", { params }).then((r) => r.data);
};
export const createOrUpdateGrade = (grade: Omit<Grade, "id" | "grade_value">) =>
  api.post<Grade>("/grades", grade).then((r) => r.data);

export const getStudentGPA = (student_id: number) =>
  api.get<GPAResponse>(`/gpa/${student_id}`).then((r) => r.data);

export const getRiskStudents = () =>
  api.get<RiskStudent[]>("/risk_students").then((r) => r.data);
