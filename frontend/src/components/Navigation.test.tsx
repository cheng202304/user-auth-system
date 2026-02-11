import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navigation Component', () => {
  it('renders navigation logo', () => {
    renderWithRouter(<Navigation />);
    const logo = screen.getByText('AuthSystem');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders all navigation links', () => {
    renderWithRouter(<Navigation />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    renderWithRouter(<Navigation />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '/features');
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/register');
  });

  it('renders mobile menu toggle button', () => {
    renderWithRouter(<Navigation />);
    const toggleButton = screen.getByLabelText('Toggle menu');
    expect(toggleButton).toBeInTheDocument();
  });

  it('has aria-label on toggle button', () => {
    renderWithRouter(<Navigation />);
    const toggleButton = screen.getByRole('button', { name: 'Toggle menu' });
    expect(toggleButton).toHaveAttribute('aria-label', 'Toggle menu');
  });

  it('opens mobile menu when toggle button is clicked', () => {
    renderWithRouter(<Navigation />);
    const toggleButton = screen.getByLabelText('Toggle menu');
    const navMenu = screen.getByRole('list');

    // Menu should not be open initially
    expect(navMenu).not.toHaveClass('nav-menu-open');

    // Click toggle button
    fireEvent.click(toggleButton);

    // Menu should now be open
    expect(navMenu).toHaveClass('nav-menu-open');
  });

  it('closes mobile menu when toggle button is clicked again', () => {
    renderWithRouter(<Navigation />);
    const toggleButton = screen.getByLabelText('Toggle menu');
    const navMenu = screen.getByRole('list');

    // Open menu
    fireEvent.click(toggleButton);
    expect(navMenu).toHaveClass('nav-menu-open');

    // Close menu
    fireEvent.click(toggleButton);
    expect(navMenu).not.toHaveClass('nav-menu-open');
  });

  it('closes mobile menu when a link is clicked', () => {
    renderWithRouter(<Navigation />);
    const toggleButton = screen.getByLabelText('Toggle menu');
    const navMenu = screen.getByRole('list');

    // Open menu
    fireEvent.click(toggleButton);
    expect(navMenu).toHaveClass('nav-menu-open');

    // Click a link
    const homeLink = screen.getByRole('link', { name: 'Home' });
    fireEvent.click(homeLink);

    // Menu should close
    expect(navMenu).not.toHaveClass('nav-menu-open');
  });

  it('applies correct classes to CTA link', () => {
    renderWithRouter(<Navigation />);
    const signUpLink = screen.getByRole('link', { name: 'Sign Up' });
    expect(signUpLink).toHaveClass('nav-link', 'nav-link-cta');
  });

  it('has semantic nav element', () => {
    renderWithRouter(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
