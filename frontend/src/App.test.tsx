import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/User Authentication System/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<App />);
    const descriptionElement = screen.getByText(/Frontend with React \+ TypeScript/i);
    expect(descriptionElement).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    const headerDiv = container.querySelector('.App-header');
    expect(headerDiv).toBeInTheDocument();
  });
});
