import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'
import { useNavigate } from 'react-router-dom';


function Login() {
  // State to manage form input values
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:3000/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.status === 200 && data.success) {
            const token = data.token;
            localStorage.setItem('userToken', token);
            // Navigate to dashboard or other page if needed
            navigate('/homepage');
        } else {
            // Handle login errors based on server response
            switch (data.errorField) {
                case 'email':
                    alert(data.message); // 'No user found with this email.'
                    break;
                case 'password':
                    alert(data.message); // 'Incorrect password.'
                    break;
                default:
                    alert(data.message || 'Unknown error during login!');
                    break;
            }
        }
    } catch (error) {
        console.error('There was an error logging in:', error);
    }
};




  return (
    <div className="Login-header">
      <h1>Name of App</h1>
      <div className="Login-subheader">
        <p>Welcome back!</p>
      </div>
      <div className="Login-subheader">
        <p>Login or create an account</p>
      </div>
        
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="usernameOrEmail">Username or Email</label>
          <p></p>
          <input
            className="custom-input"
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <p></p>
          <input
            className="custom-input"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button className="login-button"
        type="submit">Login</button>
      </form>
      <Link className="create-account" to="/register">Don't have an account? Register here</Link>
      <Link className='create-account' to="/forgotPassword">Forgot Password ?</Link>
    </div>
  );
}

export default Login;
