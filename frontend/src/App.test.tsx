import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from './App';

// Wrap App with BrowserRouter for testing
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui);
};

describe('App Component', () => {
  it('renders without crashing', () => {
    renderWithRouter(<App />);
    // App should render without errors
    expect(document.body).toBeInTheDocument();
  });

  it('renders login page by default (redirect)', () => {
    renderWithRouter(<App />);
    // Default route redirects to /login, which shows the login form
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
  });

  it('has a login form with email and password fields', () => {
    renderWithRouter(<App />);
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('has a submit button', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('has a link to register page', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
  });
});
