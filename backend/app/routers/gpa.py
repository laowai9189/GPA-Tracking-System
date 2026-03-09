from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student
from app.schemas.gpa import GPAResponse, GPAPoint
from app.services.gpa_service import get_student_gpa_history

router = APIRouter(prefix="/gpa", tags=["gpa"])


@router.get("/{student_id}", response_model=GPAResponse)
def get_gpa(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    history = get_student_gpa_history(db, student_id)
    gpa_points = [GPAPoint(**h) for h in history]
    current_gpa = gpa_points[-1].gpa if gpa_points else None

    return GPAResponse(
        student_id=student_id,
        student_name=student.name,
        current_gpa=current_gpa,
        gpa_history=gpa_points,
    )
