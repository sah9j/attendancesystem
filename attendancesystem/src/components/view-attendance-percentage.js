import React, { useEffect, useState } from 'react';
import StudentNavbar from './StudentNavbar';
import './view-attendance-percentage.css';

function ViewAttendancePercentage({username}) {
    const [attendanceData, setAttendanceData] = useState({});
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAttendance() {
            try {
                // Use studenthist API instead of studentpercentage
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
                
                if (result.data && result.data.length > 0) {
                    // Process the data to calculate percentages by course
                    const courseData = {};
                    
                    // Group attendance records by course
                    result.data.forEach(record => {
                        const course = record.course;
                        const status = record.attendance; // The API returns 'attendance' instead of 'status'
                        
                        if (!courseData[course]) {
                            courseData[course] = {
                                present: 0,
                                absent: 0,
                                total: 0
                            };
                        }
                        
                        if (status === 'present') {
                            courseData[course].present += 1;
                        } else if (status === 'absent') {
                            courseData[course].absent += 1;
                        }
                        
                        courseData[course].total += 1;
                    });
                    
                    setAttendanceData(courseData);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching attendance:", error);
                setError(error.message);
                setLoading(false);
            }
        }
        
        fetchAttendance();
    }, [username]);

    // Calculate percentage for each course
    const calculatePercentage = (present, total) => {
        if (total === 0) return 0;
        return ((present / total) * 100).toFixed(2);
    };

    // Determine if the student meets academic compliance (>50% attendance)
    const isCompliant = (percentage) => {
        return parseFloat(percentage) > 50;
    };

    return (
        <div className="view-attendance-percentage">
            <StudentNavbar />
            <div className="content">
                <h1>Attendance Percentage for {studentName || username}</h1>
                
                {loading ? (
                    <p>Loading attendance data...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : Object.keys(attendanceData).length === 0 ? (
                    <p>No attendance records found.</p>
                ) : (
                    <div className="percentage-container">
                        <table border="1" cellPadding="8" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Total Classes</th>
                                    <th>Attendance Percentage</th>
                                    <th>Academic Compliance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(attendanceData).map(course => {
                                    const { present, absent, total } = attendanceData[course];
                                    const percentage = calculatePercentage(present, total);
                                    const compliant = isCompliant(percentage);
                                    
                                    return (
                                        <tr key={course}>
                                            <td>{course}</td>
                                            <td>{present}</td>
                                            <td>{absent}</td>
                                            <td>{total}</td>
                                            <td>{percentage}%</td>
                                            <td style={{ color: compliant ? 'green' : 'red' }}>
                                                {compliant ? 'Compliant' : 'Non-compliant'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewAttendancePercentage;