from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student
from app.schemas.student import StudentCreate, StudentOut
from typing import List

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=List[StudentOut])
def list_students(db: Session = Depends(get_db)):
    return db.query(Student).order_by(Student.id).all()


@router.post("", response_model=StudentOut, status_code=201)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    db_student = Student(name=student.name)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student
