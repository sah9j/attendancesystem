import React, { useEffect, useState } from 'react';
import TeacherNavbar from './TeacherNavbar';
import './attendance-history.css';

function AttendanceHistory({username}) {
  //const [name, setName] = useState('Alice Smith');
  const [studentName, setStudentName] = useState('');
  const [names, setNames] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enable, setEnable] = useState(0);

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

  const validateInput = () => {
    const newErrors = {};
    if (!names.map(s => s.name).includes(studentName)) {
      newErrors.studentName = 'Please select a valid student name';
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        //setRegisterError('An error occurred during registration');
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
          <datalist id="mylist">
          {names.map((sname, index) => (
          <option key={index} value={sname.name}>
            {sname.name}
          </option>))}
          </datalist>
          <input type="search" list="mylist" placeholder="Enter Student's Name" id="list" value={studentName} onChange={(e) => setStudentName(e.target.value)}></input>
          <button type="submit">Submit</button>
        </form>
        {(enable === 1) &&
          <div>
            <table>
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
