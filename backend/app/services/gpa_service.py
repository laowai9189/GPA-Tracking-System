from sqlalchemy.orm import Session
from app.models import Grade, Assessment, Course
from typing import Optional, List, Tuple
from datetime import date


def calculate_weighted_gpa(grades_with_weights: List[Tuple[Optional[float], int]]) -> Optional[float]:
    """Calculate weighted GPA from a list of (grade_value, weight) tuples.
    Ignores NA grades (grade_value == None).
    """
    valid = [(gv, w) for gv, w in grades_with_weights if gv is not None]
    if not valid:
        return None
    total_weighted = sum(gv * w for gv, w in valid)
    total_weight = sum(w for _, w in valid)
    if total_weight == 0:
        return None
    return round(total_weighted / total_weight, 4)


def get_student_gpa_history(db: Session, student_id: int) -> List[dict]:
    """Return GPA for each assessment for a student, sorted by date ascending."""
    assessments = db.query(Assessment).order_by(Assessment.assessment_date).all()
    history = []
    for assessment in assessments:
        grades = (
            db.query(Grade, Course)
            .join(Course, Grade.course_id == Course.id)
            .filter(
                Grade.student_id == student_id,
                Grade.assessment_id == assessment.id,
            )
            .all()
        )
        if not grades:
            continue
        pairs = [(g.grade_value, c.weight) for g, c in grades]
        gpa = calculate_weighted_gpa(pairs)
        if gpa is not None:
            history.append({
                "assessment_id": assessment.id,
                "assessment_date": assessment.assessment_date,
                "gpa": gpa,
            })
    return history


def get_current_gpa(db: Session, student_id: int) -> Optional[float]:
    """Return the most recent GPA for a student."""
    history = get_student_gpa_history(db, student_id)
    if not history:
        return None
    return history[-1]["gpa"]
