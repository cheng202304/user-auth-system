import React from 'react';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/ui/Card';
import './Features.css';

export const Features: React.FC = () => {
  const features = [
    {
      id: 'secure-auth',
      title: 'Secure Authentication',
      description: 'Enterprise-grade security with JWT tokens and encrypted password storage using industry best practices.',
      icon: '🔐'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Comprehensive user management with registration, login, logout, and password reset functionality.',
      icon: '👥'
    },
    {
      id: 'responsive-design',
      title: 'Responsive Design',
      description: 'Beautiful, modern interface that works seamlessly on desktop, tablet, and mobile devices.',
      icon: '📱'
    },
    {
      id: 'real-time-updates',
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications and real-time updates for your authentication status.',
      icon: '⚡'
    },
    {
      id: 'easy-integration',
      title: 'Easy Integration',
      description: 'Simple API endpoints and well-documented codebase for easy integration with your existing systems.',
      icon: '🔧'
    },
    {
      id: 'privacy-first',
      title: 'Privacy First',
      description: 'Your data is secure with us. We follow strict privacy guidelines and never share your information.',
      icon: '🛡️'
    }
  ];

  return (
    <div className="features-page">
      <Navigation />

      <section className="features-hero">
        <div className="container">
          <h1 className="page-title">Features</h1>
          <p className="page-subtitle">
            Discover the powerful features that make our authentication system stand out
          </p>
        </div>
      </section>

      <section className="features-content">
        <div className="container">
          <div className="features-grid">
            {features.map((feature) => (
              <Card key={feature.id} hover>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 User Authentication System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
