
from fastapi import FastAPI, HTTPException, Query
import uvicorn
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Student Management API", version="1.0.0")


class Student(BaseModel):
    id: int
    name: str
    branch: str


class StudentCreate(BaseModel):
    name: str
    branch: str


students: List[Student] = [
    Student(id=1, name="Aarav", branch="CSE"),
    Student(id=2, name="Diya", branch="ECE"),
    Student(id=3, name="Rohan", branch="IT"),
]

next_id = 4


@app.get("/students", response_model=List[Student])
def list_students(branch: Optional[str] = Query(None)):
    if branch:
        return [s for s in students if s.branch.upper() == branch.upper()]
    return students


@app.get("/students/{student_id}", response_model=Student)
def get_student(student_id: int):
    for student in students:
        if student.id == student_id:
            return student
    raise HTTPException(status_code=404, detail="Student not found")


@app.post("/students", response_model=Student, status_code=201)
def create_student(student: StudentCreate):
    global next_id
    new_student = Student(id=next_id, **student.model_dump())
    students.append(new_student)
    next_id += 1
    return new_student


@app.put("/students/{student_id}", response_model=Student)
def update_student(student_id: int, student: StudentCreate):
    for i, existing in enumerate(students):
        if existing.id == student_id:
            updated = Student(id=student_id, **student.model_dump())
            students[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Student not found")


@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int):
    for i, student in enumerate(students):
        if student.id == student_id:
            students.pop(i)
            return
    raise HTTPException(status_code=404, detail="Student not found")



if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)

