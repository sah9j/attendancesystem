<?php
// backend/index.php

// Add proper CORS headers to handle preflight requests.
// This ensures that the server can accept requests from the frontend application, as 3000 is the port where the frontend 
// is running.
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection
$host = 'localhost';
$port = 3306;
$db = 'school_management';
$user = 'root';
$pass = '';

// Create connection
$conn = new mysqli($host, $user, $pass, $db, $port);

// Return an error if the connection fails
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// This will get the request URI (e.g., /api/login) requested from the frontend
$request = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// This will get the request method (GET, POST)
$method = $_SERVER['REQUEST_METHOD'];


// Routes
/*
The following routes are defined:
1. /api/login (POST): Handles user login.
2. /api/register (POST): Handles user registration.
3. /api/students (POST): Retrieves all students from the database.
4. /api/addcourse (POST): Adds a new course and enrolls selected students.
5. /api/courses (GET): Retrieves all courses in database.
6. /api/studenthist (POST): Retrieves attendance history for a student (student-side).
7. /api/studenthistory (POST): Retrieves attendance history for a student by name (teacher-side).
8. /api/markattendance (POST): Marks attendance for students.
9. /api/report (POST): Retrieves attendance report for a course.
10. /api/class_students (POST): Retrieves students enrolled in a specific course.
*/

if ($request === '/api/login' && $method === 'POST') {
    // Get the username and password from the request body
    $data = json_decode(file_get_contents('php://input'), true); 
    // Get password based on username from the database.
    $sql = "CALL get_password(?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    $hashword = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    // Check if the password matches the hashed password in the database
    if (password_verify($data['password'], $hashword[0]['password'])) {
        $sql = "CALL get_role(?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $data['username']);
        $stmt->execute();
        $result = $stmt->get_result();
        $role = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode(["message" => "Login successful!", "data" => $hashword[0], "role" => $role[0]['role']]);
    }
    else {
        echo json_encode(["error" => "Invalid username or password"]);
    }
} elseif ($request === '/api/register' && $method === 'POST') {
    // Get the data from the request body
    $data = json_decode(file_get_contents('php://input'), true); 
    $student_name = $data['firstName'] . " " . $data['lastName'];
    $hash = password_hash($data['password'], PASSWORD_DEFAULT);
    // Create a new user in the database
    $sql = "CALL create_user(?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $student_name, 
    $data['username'], $hash, $data['role']);
    $stmt->execute();
    $stmt->close();

    // If the user is a student, enroll them in the selected courses
    if ($data['role'] === 'user') {
        foreach ($data['courses'] as $course) {
            $sql = "CALL create_enrollment(?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $student_name, $course);
            $stmt->execute();
            $stmt->close();
        }
    } 
    echo json_encode(["message" => "Registration Successful"]);


} elseif ($request === '/api/students' && $method === 'POST') {
    // Get all students from the database
    $sql = "CALL get_all_students()"; 
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    echo json_encode($data);

} elseif ($request === '/api/addcourse' && $method === 'POST') {
    // Get the course name and students from the request body
    $data = json_decode(file_get_contents('php://input'), true); 
    // Create a new course in the database
    $sql = "CALL create_course(?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['course_name']);
    $stmt->execute();
    $stmt->close();

    // Enroll the selected students in the course
    foreach ($data['students'] as $student) {
        $sql = "CALL create_enrollment(?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $student, $data['course_name']);
        $stmt->execute();
        $stmt->close();
    }
    echo json_encode(["message" => "Course Registration Successful"]);
} elseif ($request === '/api/courses' && $method === 'GET') {
    // Return all courses from the database
    getCourses($conn); 

} elseif ($request === '/api/studenthist' && $method === 'POST') {
    // Get name associated with the username
    $data = json_decode(file_get_contents('php://input'), true); 
    $sql = "SELECT name from users where username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    
    // Store the student name for the response
    $studentName = $userData[0]['name'] ?? $data['username'];
    
    // Get attendance history for the student
    $sql = "CALL get_student_attendance(?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userData[0]['name']);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    echo json_encode([
        "message" => "Query successful!", 
        "data" => $data,
        "student_name" => $studentName
    ]);

} elseif ($request === '/api/studenthistory' && $method === 'POST') { 
    // Get name 
    $data = json_decode(file_get_contents('php://input'), true); 
    // Get attendance history for the student
    $sql = "CALL get_student_attendance(?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['studentName']);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    echo json_encode([
        "message" => "Query successful!", 
        "data" => $userData
    ]);
} elseif ($request === '/api/markattendance' && $method === 'POST') {
    // Get the attendance data from the request body
    $data = json_decode(file_get_contents('php://input'), true);

    // Loop through the data and mark attendance for each student
    foreach ($data as $record) {
        $student_name = $record['student_name'];
        $course = $record['course'];
        $date = $record['date'];
        $status = $record['status'];

        $sql = "CALL mark_attendance(?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        $stmt->bind_param("ssss", $student_name, $course, $date, $status);

        $stmt->execute();
    }

    // Close the statement and return a success message
    $stmt->close();
    echo json_encode(["message" => "Attendance successful!"]);

} elseif ($request === '/api/report' && $method === 'POST'){
    // Get the course name from the request body
    $data = json_decode(file_get_contents('php://input'), true); 
    // Get attendance report for the course
    $sql = "CALL get_attendance(?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['course_name']);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    echo json_encode(["message" => "Query successful!", "data" => $data]);

} elseif ($request === '/api/class_students' && $method === 'POST'){
    // Get the course name from the request body
    $data = json_decode(file_get_contents('php://input'), true); 
    // Get students enrolled in the course
    $sql = "CALL get_students(?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['course_name']);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    echo json_encode(["message" => "Query successful!", "data" => $data]);


} else {
    http_response_code(404);
    echo json_encode(["error" => "Not Found"]);
}


// --------- FUNCTION DEFINITIONS --------- //
// This function retrieves all courses from the database and returns them as a JSON response.
function getCourses($conn) {
    $sql = "SELECT name FROM courses";
    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Query failed"]);
        return;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}
?>