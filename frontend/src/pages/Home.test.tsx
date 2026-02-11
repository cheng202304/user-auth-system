import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Home } from './Home';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Home Page Component', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      takeRecords() { return []; }
      unobserve() {}
    } as any;
  });

  it('renders navigation', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('AuthSystem')).toBeInTheDocument();
  });

  it('renders hero section with title', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Secure Authentication Made Simple')).toBeInTheDocument();
  });

  it('renders hero subtitle', () => {
    renderWithRouter(<Home />);
    const subtitle = screen.getByText(/Experience enterprise-grade authentication/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('renders Get Started button in hero', () => {
    renderWithRouter(<Home />);
    const button = screen.getByRole('link', { name: 'Get Started' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/register');
  });

  it('renders Sign In button in hero', () => {
    renderWithRouter(<Home />);
    const button = screen.getByRole('link', { name: 'Sign In' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/login');
  });

  it('renders features section title', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Why Choose Our System?')).toBeInTheDocument();
  });

  it('renders features section subtitle', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Built with modern technologies/i)).toBeInTheDocument();
  });

  it('renders all six feature cards', () => {
    renderWithRouter(<Home />);
    const featureTitles = [
      'Secure Authentication',
      'User Management',
      'Responsive Design',
      'Real-time Updates',
      'Easy Integration',
      'Privacy First'
    ];
    featureTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('renders hero visual cards', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    renderWithRouter(<Home />);
    const button = screen.getByRole('link', { name: 'Create Free Account' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/register');
  });

  it('renders footer with copyright', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/2026 User Authentication System/i)).toBeInTheDocument();
  });

  it('has semantic section elements', () => {
    const { container } = renderWithRouter(<Home />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
  });
});
