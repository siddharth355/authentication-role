import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Auth: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    phone: '',
    gender: '',
  });

  const [tokenVal, setTokenVal] = useState('');

  useEffect(() => {
    if (tokenVal && tokenVal !== "") {
      console.log("Navigating to /dashboard", tokenVal);
      window.location.href = '/dashboard';
    }
  }, [tokenVal, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleUserAction = async (action: 'signup' | 'login') => {
    try {
      const filteredFormData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => value !== '')
      );
  
      const response = await axios.post(`http://localhost:5000/api/${action}`, filteredFormData);
      const token = response.data.token;
      setTokenVal(response?.data?.token);
      console.log(`User ${action === 'signup' ? 'signed up' : 'logged in'} successfully`, token);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error(`${action === 'signup' ? 'Signup' : 'Login'} failed:`, error);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Add User</h2>
        <input type="text" placeholder="Username" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} />
        <input type="text" placeholder="Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
        <input type="text" placeholder="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
        <input type="text" placeholder="Phone Number" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
        <input type="text" placeholder="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} />
        <input type="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} />
        <button className="signup-btn" onClick={() => handleUserAction('signup')}>Add</button>
      </div>

      <div className="auth-box">
        <h2>Login</h2>
        <input type="text" placeholder="Username" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} />
        <input type="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} />
        <button className="login-btn" onClick={() =>  handleUserAction('login')}>Login</button>
      </div>
    </div>
  );
};

export default Auth;
