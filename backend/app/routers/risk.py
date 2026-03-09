from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.gpa import RiskStudent
from app.services.risk_service import get_risk_students
from typing import List

router = APIRouter(tags=["risk"])


@router.get("/risk_students", response_model=List[RiskStudent])
def list_risk_students(db: Session = Depends(get_db)):
    return get_risk_students(db)
