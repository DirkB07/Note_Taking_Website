// ForgotPassword.js

import React, { useState } from 'react';
import './forgotPassword.css'; // Import the CSS file

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send a request to your backend to initiate the password reset process
    try {
      const response = await fetch('http://your-api/reset-password', { ////////////////////////////////////////////
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Display a success message to the user
        alert('Password reset email sent successfully')
      } else {
        // Handle error scenarios
        const data = await response.json();
        console.error(data.message || 'Failed to initiate password reset');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="ForgotPassword-header">
      <h2 className="ForgotPassword-subheader">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="form-group">
        <label class="email">Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="custom-input" required />
        <button type="submit" className="login-button">
          submit
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
