import React, { useEffect, useState } from 'react';
import TeacherNavbar from './TeacherNavbar';
import './attendance-history.css';

function AttendanceHistory({username}) {
  const [studentName, setStudentName] = useState('');
  const [names, setNames] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enable, setEnable] = useState(0);

  // Fetches the student names from the API when the component mounts.
  useEffect(() => {
    async function fetchStudentNames() {
      try {
        const response = await fetch('http://localhost:8000/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(result);
        setNames(result || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError(error.message);
        setHistory([]);
        setLoading(false);
      }
    }
    
    fetchStudentNames();
  }, []);

  // Validates the input to ensure a valid student name is selected.
  const validateInput = () => {
    const newErrors = {};
    if (!names.map(s => s.name).includes(studentName)) {
      newErrors.studentName = 'Please select a valid student name';
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles the form submission to fetch attendance history for the selected student.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateInput()) {
      try {
        const response = await fetch('http://localhost:8000/api/studenthistory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({studentName : studentName}),
        });

        const data = await response.json();
        setHistory(data.data || []);
        console.log(data);
        setEnable(1);
        setLoading(false);
      } catch (error) {
        console.error('error in getting attendance:', error);
      }
    }
  };

  return (
    <div className="attendance-history">
      <TeacherNavbar />
      <div className="content">
      <h1>Attendance History for {studentName}</h1>
        <form onSubmit={handleSubmit}>
          {/* This html section allows the user to select which student they wish to see the attendance of, while also being
          able to manually enter a name if they wish. */}
          <datalist id="mylist">
          {names.map((sname, index) => (
          <option key={index} value={sname.name}>
            {sname.name}
          </option>))}
          </datalist>
          <input type="search" list="mylist" placeholder="Enter Student's Name" id="list" value={studentName} onChange={(e) => setStudentName(e.target.value)}></input>
          <button type="submit">Submit</button>
        </form>
        {/* If the user has submitted a valid name, display a table showing the student's attendance history. */}
        {(enable === 1) &&
          <div>
            <table border="1" cellPadding="8" cellSpacing="0">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index}>
                    <td>{record.course}</td>
                    <td>{record.date}</td>
                    <td>{record.attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          }
      </div>
    </div>
  );
}

export default AttendanceHistory;
