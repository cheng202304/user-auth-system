import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/auth/RegisterForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div className="placeholder-page">Login page coming soon...</div>} />
        </Routes>
      </div>
    </Router>
  );
}

function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>User Authentication System</h1>
          <p>Create your account to get started</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

export default App;
