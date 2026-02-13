import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toHaveTextContent('User Authentication System');
  });

  it('renders the navigation link', () => {
    render(<App />);
    const linkElement = screen.getByText('Profile');
    expect(linkElement).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<App />);
    const welcomeElement = screen.getByText(/Welcome to the User Authentication System/i);
    expect(welcomeElement).toBeInTheDocument();
  });

  it('has correct structure with router', () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    const headerDiv = container.querySelector('.App-header');
    expect(headerDiv).toBeInTheDocument();
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
