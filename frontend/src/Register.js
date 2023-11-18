import React, { useState } from 'react';
import './Register.css'
import { useNavigate } from 'react-router-dom';


function Register() {
  const navigate = useNavigate();

  // State to manage form input values
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // State to manage password match status and error message
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = (email) => {
    // Use a regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check if passwords match and update the state accordingly
    if (name === 'confirmPassword') {
      setPasswordsMatch(formData.password === value);

      // Update the error message
      if (formData.password !== value) {
        setErrorMessage("Passwords don't match");
      } else {
        setErrorMessage('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
        setErrorMessage("Passwords don't match");
        return;
    }

    // Email validation using a regex

    if (isValidEmail(formData.email)) {
      // The email is valid, you can proceed with form submission or other actions
      // Make an HTTP POST request to the backend
      try {
        const response = await fetch('http://localhost:3000/user/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
          });
          const token = ""
          const data = await response.json();
          // Handle the response (maybe navigate the user to another page or show a success message)
          if (data.success) {
            alert('Registration successful!');
            localStorage.setItem('userToken', data.token);
            navigate('/homepage'); 
        } else {
            if (data.errorField) {
                switch (data.errorField) {
                    case 'email':
                        alert('Email already exists!');
                        break;
                    case 'username':
                        alert('Username already exists!');
                        break;
                    default:
                        alert('Unknown error!');
                        break;
                }
            } else {
                alert('Registration failed! ' + (data.message || ''));
            }
        }
      } catch (error) {
          console.error('There was an error registering the user:', error);
      }
    } else {
      // The email is not valid, handle accordingly (e.g., show an error message)
      alert('Invalid email address');
    }

};

  return (
    <div className="Login-header">
      <h1>Name of App</h1>
      <div className="Login-subheader">
        <p>Welcome!</p>
      </div>
      <div className="Login-subheader">
        <p>Create an account</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <p></p>
          <input
            className="custom-input"
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <p></p>
          <input
            className="custom-input"
            type="email"
            id="email"
            name="email"
            value={formData.email}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <p></p>
          <input
            className={`custom-input ${!passwordsMatch ? 'input-error' : ''}`}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          {/* Display error message if passwords don't match */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
        <button className="register-button" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
