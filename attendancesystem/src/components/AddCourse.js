import React, { useState, useEffect } from 'react';
import TeacherNavbar from './TeacherNavbar';
import './AddCourse.css';

function AddCourse() {
    const [courseName, setCourseName] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Fetch students from the API when the component mounts.
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

    // updates the selected students when the select input changes
    const handleSelectChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions); // Get selected options
        const selectedValues = selectedOptions.map(option => option.value); // Extract values
        setSelectedStudents(selectedValues); // Update state
    };

    // Adds the course, along with enrolling the selected students to the course, when form is submitted.
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(students);
        const response = await fetch('http://localhost:8000/api/addcourse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_name: courseName, students: selectedStudents })
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
        {/* This div handles the course name part of the form. */}
          <div className="form-group">
            <label htmlFor="course-name">Course Name:</label>
            <input
              type="text"
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          {/* This div handles the selecting students part of the form. */}
          <div className="form-group">
            <label htmlFor="students">Select Students:</label>
            <select id="students" multiple onChange={handleSelectChange}>
              {students.map((student, index) => (
                <option key={index} value={student.name} >
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
