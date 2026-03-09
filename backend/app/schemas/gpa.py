from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class GPAPoint(BaseModel):
    assessment_id: int
    assessment_date: date
    gpa: float


class GPAResponse(BaseModel):
    student_id: int
    student_name: str
    current_gpa: Optional[float]
    gpa_history: List[GPAPoint]


class RiskStudent(BaseModel):
    student_id: int
    name: str
    current_gpa: Optional[float]
    trend: List[Optional[float]]
    risk: bool
