import logo from './logo.svg';
import Login from './Login';
import Register from './Register';
import Update_or_delete_user from './Update_or_delete_user';
import ForgotPassword from './forgotPassword';
import './App.css';
import React from 'react';
import Homepage from './Homepage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';  // Adjust the path based on where you placed the file



function App() {
  return (
      <Router>
          <div className="App">
              <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/update-or-delete-user" element={<Update_or_delete_user />} />
                  <Route path="/homepage" element={<Homepage />} />
                  <Route path='/forgotPassword' element={<ForgotPassword/>}/>
                  {/* Default redirect to /login */}
                  <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
          </div>
      </Router>
  );
}


export default App;

