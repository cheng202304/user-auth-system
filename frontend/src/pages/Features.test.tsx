import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Features } from './Features';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Features Page Component', () => {
  it('renders navigation', () => {
    renderWithRouter(<Features />);
    expect(screen.getByText('AuthSystem')).toBeInTheDocument();
  });

  it('renders page title', () => {
    renderWithRouter(<Features />);
    const pageTitle = screen.getAllByText('Features');
    expect(pageTitle.length).toBeGreaterThan(0);
    // Check that h1 element exists
    const h1Element = screen.getByRole('heading', { level: 1 });
    expect(h1Element).toHaveTextContent('Features');
  });

  it('renders page subtitle', () => {
    renderWithRouter(<Features />);
    const subtitle = screen.getByText(/Discover the powerful features/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('renders all six feature cards', () => {
    renderWithRouter(<Features />);
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

  it('renders feature descriptions', () => {
    renderWithRouter(<Features />);
    expect(screen.getByText(/Enterprise-grade security with JWT/i)).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive user management/i)).toBeInTheDocument();
    expect(screen.getByText(/Beautiful, modern interface/i)).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    renderWithRouter(<Features />);
    expect(screen.getByText(/2026 User Authentication System/i)).toBeInTheDocument();
  });

  it('has semantic section elements', () => {
    const { container } = renderWithRouter(<Features />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(2); // hero and content sections
  });

  it('has proper page structure with hero and content', () => {
    const { container } = renderWithRouter(<Features />);
    expect(container.querySelector('.features-hero')).toBeInTheDocument();
    expect(container.querySelector('.features-content')).toBeInTheDocument();
  });

  it('renders features in a grid layout', () => {
    const { container } = renderWithRouter(<Features />);
    const grid = container.querySelector('.features-grid');
    expect(grid).toBeInTheDocument();
  });
});
