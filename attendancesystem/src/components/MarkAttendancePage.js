import React, { useEffect, useState } from 'react';
import TeacherNavbar from './TeacherNavbar';
import './MarkAttendancePage.css';

const MarkAttendancePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);

  // Fetch courses
  useEffect(() => {
    fetch('http://localhost:8000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => setError("Could not load courses."));
  }, []);

  // Fetch students when a course is selected
  useEffect(() => {
    if (!selectedCourse) return;

    fetch('http://localhost:8000/api/class_students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_name: selectedCourse }),
    })
      .then(res => res.json())
      .then(data => {
        const studentdata = data.data;
        if (Array.isArray(studentdata)) {
          setStudents(studentdata);
          const initialAttendance = {};
          studentdata.forEach(student => {
            initialAttendance[student.student] = 'present';
          });
          setAttendance(initialAttendance);
        } else {
          setError("Failed to load students.");
        }
      })
      .catch(() => setError("Failed to fetch students."));
  }, [selectedCourse]);

  // Handle dropdown changes
  const handleStatusChange = (studentName, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentName]: status
    }));
  };

  // Submit attendance
  const handleSubmit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = students.map(student => ({
    student_name: student.student,     
    course: selectedCourse,
    date: today,
    status: attendance[student.student] || "absent"
    }));
    
    try {
      const response = await fetch('http://localhost:8000/api/markattendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      alert("Attendance submitted successfully.");
    } catch (err) {
      alert("Failed to submit attendance.");
    }
  };

  return (
    <div className="mark-attendance">
      <TeacherNavbar />
      <h1>Mark Attendance</h1>

      <label>Select Course: </label>
      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
        <option value="">-- Select a course --</option>
        {courses.map((course, index) => (
          <option key={index} value={course.name}>
            {course.name}
          </option>
        ))}
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {students.length > 0 && (
        <div>
          <h3>Students in {selectedCourse}</h3>
          <ul>
            {students.map((student, index) => (
              <li key={student.student || index}>
                {student.student}
                <select
                  value={attendance[student.student]}
                  onChange={e => handleStatusChange(student.student, e.target.value)}
                  style={{ marginLeft: '10px' }}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </li>
            ))}
          </ul>
          <button onClick={handleSubmit}>Submit Attendance</button>
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
