import React, { useEffect, useState } from 'react';
import StudentNavbar from './StudentNavbar';
import './view-attendance-history.css';

function ViewAttendanceHistory({username}) {
  
  const [studentName, setStudentName] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await fetch('http://localhost:8000/api/studenthist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: username })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(result);
        
        // Extract student name if available in the API response
        if (result.student_name) {
          setStudentName(result.student_name);
        }
        
        setHistory(result.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError(error.message);
        setHistory([]);
        setLoading(false);
      }
    }
    
    fetchAttendance();
  }, [username]);

  // Group attendance records by course
  const attendanceByClass = history && history.length ? history.reduce((acc, record) => {
    if (!acc[record.course]) {
      acc[record.course] = [];
    }
    acc[record.course].push(record);
    return acc;
  }, {}) : {};

  return (
    <div className="view-attendance-history">
      <StudentNavbar />
      <div className="content">
        <h1>Attendance History for {studentName || username}</h1>
        
        {loading ? (
          <p>Loading attendance data...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : history.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          Object.keys(attendanceByClass).map((course) => (
            <div key={course} className="course-attendance">
              <h2>{course}</h2>
              <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceByClass[course].map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.attendance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewAttendanceHistory;

