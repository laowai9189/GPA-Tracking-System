from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import students, courses, assessments, grades, gpa, risk
from app.seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GPA Tracking System API",
    description="Academic Risk Monitoring System for tracking student GPA",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(assessments.router)
app.include_router(grades.router)
app.include_router(gpa.router)
app.include_router(risk.router)


@app.on_event("startup")
def on_startup():
    seed_database()


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "GPA Tracking System API is running"}
