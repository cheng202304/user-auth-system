import React from 'react';
import { Navigation } from '../components/Navigation';
import './Login.css';

export const Login: React.FC = () => {
  return (
    <div className="login-page">
      <Navigation />
      <div className="login-container">
        <h1>Login</h1>
        <p>Login page - coming soon</p>
      </div>
    </div>
  );
};
