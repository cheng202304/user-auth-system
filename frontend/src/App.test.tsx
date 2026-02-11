import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App Component', () => {
  it('renders home page at root path', () => {
    renderApp();
    expect(screen.getByText('Secure Authentication Made Simple')).toBeInTheDocument();
  });

  it('renders navigation', () => {
    renderApp();
    expect(screen.getByText('AuthSystem')).toBeInTheDocument();
  });

  it('has route structure', () => {
    renderApp();
    // Verify navigation links exist
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('renders hero section on home page', () => {
    renderApp();
    expect(screen.getByText('Secure Authentication Made Simple')).toBeInTheDocument();
    expect(screen.getByText(/Experience enterprise-grade authentication/i)).toBeInTheDocument();
  });

  it('renders features on home page', () => {
    renderApp();
    expect(screen.getByText('Why Choose Our System?')).toBeInTheDocument();
  });

  it('renders CTA section on home page', () => {
    renderApp();
    expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
  });
});
