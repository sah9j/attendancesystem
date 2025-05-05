import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({setUsername, role, setRole}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = async () => {
    const newErrors = {};
    let userrole = null;
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    if (formData.username && formData.password) {
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
      console.log('Role:', result.role);
      }
    }
    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      userrole
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, userrole } = await validateForm();
    console.log('User Role:', userrole);
    if (isValid) {
      // TODO: Implement login logic here
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