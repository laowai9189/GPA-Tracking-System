from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentOut
from typing import List

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.get("", response_model=List[AssessmentOut])
def list_assessments(db: Session = Depends(get_db)):
    return db.query(Assessment).order_by(Assessment.assessment_date).all()


@router.post("", response_model=AssessmentOut, status_code=201)
def create_assessment(assessment: AssessmentCreate, db: Session = Depends(get_db)):
    db_assessment = Assessment(assessment_date=assessment.assessment_date)
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment
