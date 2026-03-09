# GPA Tracking and Academic Risk Monitoring System

A full-stack web application for tracking student GPA, detecting academic risk, and visualizing performance trends.

## Features

- 📊 **Dashboard** – Class average GPA, highest/lowest GPA, risk students count, GPA distribution chart, and class-wide GPA trend chart
- 👨‍🎓 **Student List** – All 12 students with current GPA, previous GPA, change indicator, and risk status
- 🔍 **Student Detail** – Individual GPA trend chart, full GPA history, and detailed grade table per assessment
- ✏️ **Grade Entry** – Spreadsheet-style interface for teachers to enter grades (auto-saves on selection)
- ⚠️ **Risk Detection** – Automatically flags students whose GPA has declined 3 consecutive times
- 📈 **Recharts visualizations** – Bar chart for GPA distribution, line charts for trends

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Backend   | Python FastAPI + SQLAlchemy    |
| Database  | PostgreSQL                     |
| Frontend  | Next.js + React + TypeScript   |
| Styling   | TailwindCSS                    |
| Charts    | Recharts                       |

## Project Structure

```
GPA-Tracking-System/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy models (Student, Course, Assessment, Grade)
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # FastAPI route handlers
│   │   ├── services/         # GPA calculation & risk detection logic
│   │   ├── database.py       # DB connection & session
│   │   └── seed.py           # Database seeder (12 students, 10 courses, sample grades)
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── pages/
│   │   ├── index.tsx         # Dashboard
│   │   ├── students/
│   │   │   ├── index.tsx     # Student List
│   │   │   └── [id].tsx      # Student Detail
│   │   └── grades/
│   │       └── index.tsx     # Grade Entry
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── GPADistributionChart.tsx
│   │   └── GPATrendChart.tsx
│   ├── services/
│   │   └── api.ts            # API client (axios)
│   ├── styles/globals.css
│   └── Dockerfile
└── docker-compose.yml
```

## Running Locally

### Option 1: Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up --build

# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
# API docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

**Prerequisites:** PostgreSQL running locally, Python 3.11+, Node.js 20+

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run the server (auto-seeds DB on first startup)
uvicorn main:app --reload
```

The backend will:
- Create all database tables automatically
- Seed the database with 12 students, 10 courses, 5 assessments, and sample grades
- Start serving at `http://localhost:8000`

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | /students             | List all students              |
| POST   | /students             | Create a student               |
| GET    | /courses              | List all courses               |
| GET    | /assessments          | List all assessments           |
| POST   | /assessments          | Create an assessment           |
| GET    | /grades?student_id=   | Get grades (optionally by student) |
| POST   | /grades               | Create/update a grade          |
| GET    | /gpa/{student_id}     | Get GPA history for a student  |
| GET    | /risk_students        | Get all students with risk status |

Interactive API docs: `http://localhost:8000/docs`

## GPA Calculation

Weighted GPA formula:
```
Weighted GPA = SUM(course_weight × grade_value) / SUM(course_weight)
```

- **NA grades are excluded** from GPA calculation
- Grade values: A+ = 4.3, A = 4.0, B+ = 3.7, B = 3.5, C+ = 3.3, C = 3.0, D+ = 2.5, D = 2.0, F = 0, NA = null

## Risk Detection

A student is flagged **"At Risk"** when their GPA has declined for 3 consecutive assessments:
```
GPA3 < GPA2 < GPA1
```

## Course Weights

| Course     | Weight |
|------------|--------|
| English    | 8      |
| Math       | 5      |
| Physics    | 4      |
| Chemistry  | 4      |
| Biology    | 4      |
| Economics  | 4      |
| Psychology | 4      |
| Chinese    | 3      |
| Geography  | 2      |
| History    | 2      |

## GPA Distribution Categories

| Category | Range       |
|----------|-------------|
| High     | ≥ 3.7       |
| Medium   | 3.0 – 3.69  |
| Low      | < 3.0       |