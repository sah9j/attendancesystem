import React, { useEffect, useState } from 'react';
import TeacherNavbar from './TeacherNavbar';

const MarkAttendancePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  // Fetch courses
  useEffect(() => {
    fetch('http://localhost:8000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error fetching courses:', err));
  }, []);

  // Fetch students for selected course
  useEffect(() => {
    if (!selectedCourse) return;

    fetch('http://localhost:8000/api/course_enrollment')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => item.course === selectedCourse);
        const studentNames = filtered.map(item => item.studentName);
        setStudents(studentNames);

        const defaultStatus = {};
        studentNames.forEach(name => defaultStatus[name] = 'Present');
        setAttendance(defaultStatus);
      })
      .catch(err => console.error('Error fetching students:', err));
  }, [selectedCourse]);

  const handleStatusChange = (studentName, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentName]: status
    }));
  };

  const handleSubmit = async () => {
  const today = new Date().toISOString().split('T')[0];
  const payload = students.map(name => ({
    username: name, // Or `studentUsername` if that's what your backend expects
    course: selectedCourse,
    attendance: attendance[name],
    date: today
  }));

  try {
    const response = await fetch('http://localhost:8000/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! ${response.status}: ${errorText}`);
    }

    alert('Attendance submitted successfully!');
  } catch (err) {
    console.error('Error submitting attendance:', err);
    alert('Failed to submit attendance.');
  }
};

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mark Attendance</h2>

      <label>Select Course: </label>
      <select onChange={e => setSelectedCourse(e.target.value)} value={selectedCourse}>
        <option value="">-- Select --</option>
        {courses.map(course => (
          <option key={course.course} value={course.course}>{course.course}</option>
        ))}
      </select>

      {students.length > 0 && (
        <div>
          <h3>Students in {selectedCourse}</h3>
          <ul>
            {students.map(name => (
              <li key={name}>
                {name}
                <select
                  value={attendance[name]}
                  onChange={e => handleStatusChange(name, e.target.value)}
                  style={{ marginLeft: '10px' }}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
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