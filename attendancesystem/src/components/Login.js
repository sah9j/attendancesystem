import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// In this component, we not only want to have users login, but also store the username and role for future use.
const Login = ({setUsername, role, setRole}) => {
  const navigate = useNavigate();
  // stores all of the information gathered from the form.
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  // stores any errors that may occur during the login process.
  const [errors, setErrors] = useState({});

  // Ensures that formData is updated correctly
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate form data
  const validateForm = async () => {
    const newErrors = {};
    // userrole is used to store the role of the user after they login.
    // This is done because the set method is asynchronous, which makes the role variable unreliable in actually having the
    // correct value when we check it in the handleSubmit function.
    let userrole = null;
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    if (formData.username && formData.password) {
      // This part validates the username and password.
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });
  
      if (!response.ok) {
        newErrors.server = 'Invalid username or password';
      } else {
      const result = await response.json();
      setRole(result.role); 
      userrole = result.role;
      setUsername(formData.username);
      }
    }
    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      userrole
    };
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, userrole } = await validateForm();
    if (isValid) {
      console.log('Login form submitted:', formData);
      // Redirect based on role
      if (userrole === 'user') {
        navigate('/shome');
      } else if (userrole === 'admin') {
        navigate('/thome');
      } else {
        console.error('Unknown role:', role);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* This div handles the username part of the form. */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="username"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>
          {/* This div handles the password part of the form. */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          {/* This is the submit button and the link to the register page. */}
          <button type="submit" className="login-button">Login</button>
          <div className="register-link">
            <p>Don't have an account? <a href="/register">Register Here</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 