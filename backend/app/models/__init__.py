from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    grades = relationship("Grade", back_populates="student")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    weight = Column(Integer, nullable=False)

    grades = relationship("Grade", back_populates="course")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    assessment_date = Column(Date, nullable=False)

    grades = relationship("Grade", back_populates="assessment")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    grade_letter = Column(String, nullable=False)
    grade_value = Column(Float, nullable=True)

    student = relationship("Student", back_populates="grades")
    course = relationship("Course", back_populates="grades")
    assessment = relationship("Assessment", back_populates="grades")
