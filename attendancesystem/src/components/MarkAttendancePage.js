import React, { useEffect, useState } from 'react';
import TeacherNavbar from './TeacherNavbar';
import './MarkAttendancePage.css'

const MarkAttendancePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);

  // Fetch courses
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => {
        console.error("Failed to fetch courses:", err);
        setError("Could not load courses.");
      });
  }, []);

  // Fetch students
  useEffect(() => {
    if (!selectedCourse) return;

    fetch('/api/getStudentsForCourse.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_name: selectedCourse }),
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          const initialAttendance = {};
          data.forEach(student => {
            initialAttendance[student.username] = 'present';
          });
          setAttendance(initialAttendance);
        } else {
          console.error("Unexpected response format:", data);
          setError("Failed to load students.");
        }
      })
      .catch(err => {
        console.error("Error fetching students:", err);
        setError("Failed to fetch students.");
      });
  }, [selectedCourse]);

  const handleStatusChange = (username, status) => {
    setAttendance(prev => ({
      ...prev,
      [username]: status
    }));
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = students.map(student => ({
      username: student.username,
      course: selectedCourse,
      date: today,
      status: attendance[student.username]
    }));

    try {
      const response = await fetch('/api/submitAttendance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      alert("Attendance submitted successfully.");
    } catch (err) {
      console.error("Error submitting attendance:", err);
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
            {students.map(student => (
              <li key={student.username}>
                {student.full_name || student.username}
                <select
                  value={attendance[student.username]}
                  onChange={e => handleStatusChange(student.username, e.target.value)}
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