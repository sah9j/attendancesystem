import React, { useEffect, useState } from 'react';
import TeacherNavbar from './TeacherNavbar';
import './attendance-history.css';

function AttendanceHistory({username}) {
  //const [name, setName] = useState('Alice Smith');
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
  }, []);

  // Group attendance records by name
  const attendanceByStudent = history && history.length ? history.reduce((acc, record) => {
    if (!acc[record.student]) {
      acc[record.student] = [];
    }
    acc[record.student].push(record);
    return acc;
  }, {}) : {};
  return (
    <div className="attendance-history">
      <TeacherNavbar />
      <div className="content">
        <h1>Attendance History for {studentName||username}</h1>
        {loading ? (
          <p>Loading attendance data...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : history.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          Object.keys(attendanceByStudent).map((student) => (
            <div key={student} className="course-attendance">
              <h2>{student}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceByStudent[student].map((record, index) => (
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

export default AttendanceHistory;
