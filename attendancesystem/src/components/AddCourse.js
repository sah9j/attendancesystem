import React, { useState, useEffect } from 'react';
import TeacherNavbar from './TeacherNavbar';
import './AddCourse.css';

function AddCourse() {
    const [courseName, setCourseName] = useState('');
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => setStudents(data || []))
        .catch(error => console.error('Error fetching students:', error));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(students);
        const response = await fetch('http://localhost:8000/api/addcourse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_name: courseName, students: students })
          });
      
          if (!response.ok) {
            console.error('Error:', response.statusText);
          } else {
          const result = await response.json();
          alert("Course added successfully.");
        };
    }
  return (
    <div className="add-course-form">
      <TeacherNavbar />
      <div className="content">
        <h1>Add Course</h1>
        <form className="add-course-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="course-name">Course Name:</label>
            <input
              type="text"
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="students">Select Students:</label>
            <select id="students" multiple>
              {students.map((student, index) => (
                <option key={index} value={student.name}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Add Course</button>
        </form>
      </div>
    </div>
  );
}

export default AddCourse;
