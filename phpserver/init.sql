DROP DATABASE IF EXISTS school_management;
CREATE DATABASE school_management;

USE school_management;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(100),
  role VARCHAR(50) CHECK (role IN ('admin', 'user'))
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL unique
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student VARCHAR(100) REFERENCES users(name),
  course VARCHAR(50),
  date DATE NOT NULL,
  status VARCHAR(10) CHECK (status IN ('present', 'absent')),
  FOREIGN KEY (student) REFERENCES users(name),
  FOREIGN KEY (course) REFERENCES courses(name)
);

CREATE TABLE IF NOT EXISTS course_enrollment (
  id SERIAL PRIMARY KEY,
  student VARCHAR(100),
  course VARCHAR(50),
  FOREIGN KEY (student) REFERENCES users(name) ON DELETE CASCADE,
  FOREIGN KEY (course) REFERENCES courses(name) ON DELETE CASCADE
);

-- Seed users
INSERT INTO users (name, username, password, role) VALUES
('Alice Smith', 'asmith', 'password123', 'user'),
('Bob Johnson', 'bjohnson', 'securepass', 'user'),
('Dr. Admin', 'admin', 'adminpass', 'admin');

-- Seed courses
INSERT INTO courses (name) VALUES
('Math 101'),
('Science 202');

-- Seed course_enrollment
INSERT INTO course_enrollment (student, course) VALUES
('Alice Smith', 'Math 101'),
('Alice Smith', 'Science 202'),
('Bob Johnson', 'Math 101');

-- Seed attendance
INSERT INTO attendance (student, course, date, status) VALUES
('Alice Smith', 'Math 101', '2025-04-28', 'present'),
('Alice Smith', 'Math 101', '2025-04-29', 'absent'),
('Alice Smith', 'Science 202', '2025-04-28', 'present'),
('Bob Johnson', 'Math 101', '2025-04-28', 'present'),
('Bob Johnson', 'Math 101', '2025-04-29', 'present');


CREATE PROCEDURE get_attendance(IN course_name VARCHAR(100))
BEGIN
    SELECT student, date, status AS attendance 
    FROM attendance 
    WHERE course = course_name 
    ORDER BY student;
END;

CREATE PROCEDURE get_student_attendance(IN p_student_name VARCHAR(100))
BEGIN
    SELECT course, date, status AS attendance 
    FROM attendance 
    WHERE student = p_student_name 
    ORDER BY date;
END;

CREATE PROCEDURE get_students(IN course_name VARCHAR(100))
BEGIN
    SELECT student 
    FROM course_enrollment 
    WHERE course = course_name;
END;

CREATE PROCEDURE get_studentcnt(IN course_name VARCHAR(100))
BEGIN
    SELECT COUNT(*) 
    FROM course_enrollment 
    WHERE course = course_name;
END;

CREATE PROCEDURE get_attendancecnt(IN course_name VARCHAR(100))
BEGIN
    SELECT COUNT(*) 
    FROM attendance 
    WHERE course = course_name AND status = 'present';
END;

CREATE PROCEDURE get_studentpercentage(IN p_course_name VARCHAR(100), IN p_name VARCHAR(100))
BEGIN
    SELECT status, COUNT(*) as count
    FROM attendance
    WHERE (course = p_course_name and student = p_name)
    GROUP BY status;
END;

CREATE PROCEDURE create_user(IN p_name VARCHAR(100), IN p_username VARCHAR(100), IN p_password VARCHAR(100), IN p_role VARCHAR(50))
BEGIN
    INSERT INTO users (name, username, password, role) VALUES (p_name, p_username, p_password, p_role);
END;

CREATE PROCEDURE mark_attendance(IN p_name VARCHAR(100), IN p_course_name VARCHAR(100), IN p_date DATE, IN p_status VARCHAR(10))
BEGIN
    INSERT INTO attendance(student, course, date, status) VALUES (p_name, p_course_name, p_date, p_status);
END;

CREATE PROCEDURE create_enrollment(IN p_name VARCHAR(100), IN p_course_name VARCHAR(100))
BEGIN
    INSERT INTO course_enrollment(student, course) VALUES (p_name, p_course_name)
END;

CREATE PROCEDURE get_password(IN p_username VARCHAR(100)) 
BEGIN
    SELECT password
    FROM users
    WHERE username = p_username;
END;