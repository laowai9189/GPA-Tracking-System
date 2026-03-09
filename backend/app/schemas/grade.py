from pydantic import BaseModel
from typing import Optional


GRADE_MAP = {
    "A+": 4.3,
    "A": 4.0,
    "B+": 3.7,
    "B": 3.5,
    "C+": 3.3,
    "C": 3.0,
    "D+": 2.5,
    "D": 2.0,
    "F": 0.0,
    "NA": None,
}


class GradeBase(BaseModel):
    student_id: int
    course_id: int
    assessment_id: int
    grade_letter: str


class GradeCreate(GradeBase):
    pass


class GradeOut(GradeBase):
    id: int
    grade_value: Optional[float]

    class Config:
        from_attributes = True
