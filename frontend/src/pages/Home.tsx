import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Navigation } from '../components/Navigation';
import './Home.css';

const features = [
  {
    id: 'secure-auth',
    title: 'Secure Authentication',
    description: 'Enterprise-grade security with JWT tokens and encrypted password storage using industry best practices.'
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Comprehensive user management with registration, login, logout, and password reset functionality.'
  },
  {
    id: 'responsive-design',
    title: 'Responsive Design',
    description: 'Beautiful, modern interface that works seamlessly on desktop, tablet, and mobile devices.'
  },
  {
    id: 'real-time-updates',
    title: 'Real-time Updates',
    description: 'Stay informed with instant notifications and real-time updates for your authentication status.'
  },
  {
    id: 'easy-integration',
    title: 'Easy Integration',
    description: 'Simple API endpoints and well-documented codebase for easy integration with your existing systems.'
  },
  {
    id: 'privacy-first',
    title: 'Privacy First',
    description: 'Your data is secure with us. We follow strict privacy guidelines and never share your information.'
  }
] as const;

export const Home: React.FC = () => {

  return (
    <div className="home-page">
      <Navigation />

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Secure Authentication Made Simple
          </h1>
          <p className="hero-subtitle">
            Experience enterprise-grade authentication with modern design and developer-friendly APIs.
            Get started in minutes with our robust and scalable user authentication system.
          </p>
          <div className="hero-actions">
            <Link to="/register">
              <Button size="large">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="large">Sign In</Button>
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-container">
            <Card hover className="hero-card hero-card-1">
              <div className="card-icon">🔐</div>
              <h3>Secure</h3>
              <p>End-to-end encryption for all your data</p>
            </Card>
            <Card hover className="hero-card hero-card-2">
              <div className="card-icon">⚡</div>
              <h3>Fast</h3>
              <p>Lightning-fast authentication with minimal latency</p>
            </Card>
            <Card hover className="hero-card hero-card-3">
              <div className="card-icon">🛡️</div>
              <h3>Protected</h3>
              <p>Advanced security measures to protect your accounts</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Our System?</h2>
          <p className="section-subtitle">
            Built with modern technologies and security best practices
          </p>
          <div className="features-grid">
            {features.map((feature) => (
              <Card key={feature.id} hover>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">
            Join thousands of developers who trust our authentication system
          </p>
          <div className="cta-actions">
            <Link to="/register">
              <Button size="large">Create Free Account</Button>
            </Link>
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
