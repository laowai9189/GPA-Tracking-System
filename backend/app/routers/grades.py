from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Grade
from app.schemas.grade import GradeCreate, GradeOut, GRADE_MAP
from typing import List, Optional

router = APIRouter(prefix="/grades", tags=["grades"])


@router.get("", response_model=List[GradeOut])
def list_grades(student_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Grade)
    if student_id is not None:
        query = query.filter(Grade.student_id == student_id)
    return query.order_by(Grade.id).all()


@router.post("", response_model=GradeOut, status_code=201)
def create_grade(grade: GradeCreate, db: Session = Depends(get_db)):
    if grade.grade_letter not in GRADE_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid grade_letter '{grade.grade_letter}'. Must be one of: {list(GRADE_MAP.keys())}",
        )
    grade_value = GRADE_MAP[grade.grade_letter]
    # Upsert: if a grade already exists for same student/course/assessment, update it
    existing = (
        db.query(Grade)
        .filter(
            Grade.student_id == grade.student_id,
            Grade.course_id == grade.course_id,
            Grade.assessment_id == grade.assessment_id,
        )
        .first()
    )
    if existing:
        existing.grade_letter = grade.grade_letter
        existing.grade_value = grade_value
        db.commit()
        db.refresh(existing)
        return existing
    db_grade = Grade(
        student_id=grade.student_id,
        course_id=grade.course_id,
        assessment_id=grade.assessment_id,
        grade_letter=grade.grade_letter,
        grade_value=grade_value,
    )
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade
