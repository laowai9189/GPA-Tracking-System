from pydantic import BaseModel
from datetime import date


class AssessmentBase(BaseModel):
    assessment_date: date


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentOut(AssessmentBase):
    id: int

    class Config:
        from_attributes = True
