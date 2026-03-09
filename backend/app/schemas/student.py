from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StudentBase(BaseModel):
    name: str


class StudentCreate(StudentBase):
    pass


class StudentOut(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
