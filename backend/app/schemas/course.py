from pydantic import BaseModel


class CourseBase(BaseModel):
    name: str
    weight: int


class CourseOut(CourseBase):
    id: int

    class Config:
        from_attributes = True
