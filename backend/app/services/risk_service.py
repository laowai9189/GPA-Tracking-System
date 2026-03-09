from sqlalchemy.orm import Session
from app.models import Student
from app.services.gpa_service import get_student_gpa_history
from typing import List


def get_risk_students(db: Session) -> List[dict]:
    """Return students flagged as Risk: GPA declined 3 consecutive times."""
    students = db.query(Student).all()
    risk_list = []
    for student in students:
        history = get_student_gpa_history(db, student.id)
        gpas = [h["gpa"] for h in history]
        is_risk = False
        if len(gpas) >= 3:
            # Check the last 3 GPA values
            g1, g2, g3 = gpas[-3], gpas[-2], gpas[-1]
            if g3 < g2 < g1:
                is_risk = True
        risk_list.append({
            "student_id": student.id,
            "name": student.name,
            "current_gpa": gpas[-1] if gpas else None,
            "trend": gpas[-5:] if len(gpas) >= 5 else gpas,
            "risk": is_risk,
        })
    return risk_list
