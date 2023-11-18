import React, { useState } from 'react';
import './Update_or_delete_user.css'
import { redirect, useNavigate } from 'react-router-dom';



function Update_or_delete_user() {
  const navigate = useNavigate();

  // State to manage form input values
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar_url: '',
  });

  // currently selected image
  const [selectedImage, setSelectedImage] = useState('');

  // Array of locally downloaded photo options
  const photoOptions = [
    'https://cdn.dribbble.com/users/1136598/screenshots/5980995/media/24d8d5f4e05739aaf11f714d2566fb81.gif',
    'https://media.tenor.com/OXua4v7_uSkAAAAC/profile-picture.gif',
    'https://i.pinimg.com/474x/b6/0f/20/b60f20b811cbe9a73bfbc2658ff53b74.jpg',
    'https://i.pinimg.com/originals/0f/04/37/0f04377fd5dab138e5c4b68456126da7.gif'
  ];

  const handlePhotoSelect = (e) => {
    const selectedPhoto = e.target.value;
    setFormData({
      ...formData,
      avatar_url: selectedPhoto,
    });
    setSelectedImage(selectedPhoto);
  };


  // State to manage password match status and error message
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'confirmPassword') {
      setPasswordsMatch(formData.password === value);
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

    try {
      const token = localStorage.getItem('userToken');
      // alert(token)
      const response = await fetch('http://localhost:3000/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      redirect('/homepage')
      if (data.success) {
        navigate('/homepage');
        const token = data.token;

      } else {
        if (data.errorField) {
          switch (data.errorField) {
            case 'email':
              alert('User with this email already exists!');
              break;
            case 'username':
              alert('User with this username already exists!');
              break;
            default:
              alert('Unknown error!');
              break;
          }
        } else {
          alert('Account update failed! ' + (data.message || ''));
        }
      }
    } catch (error) {
      console.error('There was an error updating the user:', error);
    }
  };

  const handleDelete = async () => {
    try {

      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:3000/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        navigate('/login');
      } else {
        alert('Account deletion failed! ' + (data.message || ''));
      }
    } catch (error) {
      console.error('There was an error deleting the user:', error);
    }
  };


  return (
    <div className="Login-header">
      <h1>Name of App</h1>
      <div className="Login-subheader">
        <p>Update your account </p>
      </div>
      <div >
        <p>(leave fields blank that needs no update)</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">New Username</label>
          <p></p>
          <input
            className="custom-input"
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          // required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">New Email</label>
          <p></p>
          <input
            className="custom-input"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          // required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <p></p>
          <input
            className="custom-input"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          // required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New password</label>
          <p></p>
          <input
            className={`custom-input ${!passwordsMatch ? 'input-error' : ''}`}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          // required
          />
          {/* Display error message if passwords don't match */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>

        <div className="form-group">
          <label>Choose a Profile Photo:</label>
          <br />
          <select
            className="form-group-dropdown"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handlePhotoSelect}
          >
            {photoOptions.map((option, index) => (
              <option key={index} value={option}>
                {`Avatar ${index + 1}`}
              </option>
            ))}
          </select>
          {/* {selectedImage && <img src={selectedImage} alt="Selected avatar" style={{ width: '50px', height: '50px', marginLeft: '10px' }} />} */}
        </div>
        <img
          className="selected-photo"
          src={formData.avatar_url}
          alt="Selected Avatar"
        />

        <div class="button-container">
          <button className="register-button" type="submit">
            Update account
          </button>
          <button className="delete-button" type="button" onClick={handleDelete}>
            Delete User account
          </button>
        </div>

      </form>
    </div>
  );
}

export default Update_or_delete_user;
