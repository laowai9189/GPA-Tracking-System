"""Seed the database with 12 students, 10 courses, assessments, and sample grades."""
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Student, Course, Assessment, Grade, Base
from app.schemas.grade import GRADE_MAP

STUDENTS = [
    "Alice Johnson",
    "Bob Smith",
    "Carol White",
    "David Brown",
    "Emma Davis",
    "Frank Miller",
    "Grace Wilson",
    "Henry Moore",
    "Isabella Taylor",
    "James Anderson",
    "Karen Thomas",
    "Liam Jackson",
]

COURSES = [
    ("Math", 5),
    ("English", 8),
    ("Physics", 4),
    ("Chemistry", 4),
    ("Biology", 4),
    ("Economics", 4),
    ("Psychology", 4),
    ("Chinese", 3),
    ("Geography", 2),
    ("History", 2),
]

GRADE_LETTERS = list(GRADE_MAP.keys())

# Weighted grade choices so that we get a mix of good, medium, and some NA
GRADE_WEIGHTS = [2, 5, 8, 10, 8, 8, 5, 5, 3, 1, 1]  # matches GRADE_LETTERS order


def generate_assessment_dates(start: date, count: int, interval_days: int = 14):
    dates = []
    current = start
    for _ in range(count):
        dates.append(current)
        current += timedelta(days=interval_days)
    return dates


def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Skip if already seeded
    if db.query(Student).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    # Seed students
    db_students = []
    for name in STUDENTS:
        s = Student(name=name)
        db.add(s)
        db_students.append(s)
    db.commit()
    for s in db_students:
        db.refresh(s)

    # Seed courses
    db_courses = []
    for name, weight in COURSES:
        c = Course(name=name, weight=weight)
        db.add(c)
        db_courses.append(c)
    db.commit()
    for c in db_courses:
        db.refresh(c)

    # Seed assessments (5 assessments, every 14 days from 2026-03-02)
    assessment_dates = generate_assessment_dates(date(2026, 3, 2), 5)
    db_assessments = []
    for d in assessment_dates:
        a = Assessment(assessment_date=d)
        db.add(a)
        db_assessments.append(a)
    db.commit()
    for a in db_assessments:
        db.refresh(a)

    random.seed(42)

    # Create declining trend for students 1-3 to demonstrate risk detection
    declining_students = {db_students[0].id, db_students[1].id, db_students[2].id}

    # Grade pools by quality tier
    high_grades = ["A+", "A", "B+"]
    medium_grades = ["B", "C+", "C"]
    low_grades = ["D+", "D", "F"]

    for student in db_students:
        for assessment_idx, assessment in enumerate(db_assessments):
            for course in db_courses:
                # Occasionally add NA to simulate missing courses
                if random.random() < 0.08:
                    letter = "NA"
                elif student.id in declining_students:
                    # Create a clear declining trend: start high, go lower
                    if assessment_idx == 0:
                        letter = random.choice(high_grades)
                    elif assessment_idx == 1:
                        letter = random.choice(high_grades + medium_grades)
                    elif assessment_idx == 2:
                        letter = random.choice(medium_grades)
                    elif assessment_idx == 3:
                        letter = random.choice(medium_grades + low_grades)
                    else:
                        letter = random.choice(low_grades)
                else:
                    # Random distribution with weights
                    letter = random.choices(GRADE_LETTERS, weights=GRADE_WEIGHTS)[0]

                grade_val = GRADE_MAP[letter]
                db.add(Grade(
                    student_id=student.id,
                    course_id=course.id,
                    assessment_id=assessment.id,
                    grade_letter=letter,
                    grade_value=grade_val,
                ))
    db.commit()
    print(f"Seeded {len(STUDENTS)} students, {len(COURSES)} courses, "
          f"{len(db_assessments)} assessments, and grades.")
    db.close()


if __name__ == "__main__":
    seed_database()
