from flask import Flask, jsonify

app = Flask(__name__)

students = [
    {"id": 1, "name": "Aarav", "branch": "CSE"},
    {"id": 2, "name": "Diya", "branch": "ECE"},
    {"id": 3, "name": "Rohan", "branch": "IT"}
]

@app.route("/")
def home():
    return "Student Management API"

@app.route("/students")
def get_students():
    return jsonify(students)

@app.route("/students/<int:student_id>")
def get_student(student_id):
    student = next((s for s in students if s["id"] == student_id), None)
    if student:
        return jsonify(student)
    else:
        return jsonify({"error": "Student not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
