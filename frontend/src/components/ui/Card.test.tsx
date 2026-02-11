import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(
      <Card>
        <h3>Card Title</h3>
        <p>Card content</p>
      </Card>
    );
    const card = screen.getByText('Card Title').closest('.card');
    expect(card).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies hover class when hover prop is true', () => {
    render(
      <Card hover>
        <p>Hoverable card</p>
      </Card>
    );
    const card = screen.getByText('Hoverable card').closest('.card');
    expect(card).toHaveClass('card-hover');
  });

  it('does not apply hover class when hover prop is false', () => {
    render(
      <Card hover={false}>
        <p>Static card</p>
      </Card>
    );
    const card = screen.getByText('Static card').closest('.card');
    expect(card).not.toHaveClass('card-hover');
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-class">
        <p>Custom card</p>
      </Card>
    );
    const card = screen.getByText('Custom card').closest('.card');
    expect(card).toHaveClass('custom-class');
  });

  it('combines all classes correctly', () => {
    render(
      <Card hover className="extra-class">
        <p>Combined card</p>
      </Card>
    );
    const card = screen.getByText('Combined card').closest('.card');
    expect(card).toHaveClass('card', 'card-hover', 'extra-class');
  });

  it('renders complex nested content', () => {
    render(
      <Card>
        <div className="card-header">
          <h3>Header</h3>
        </div>
        <div className="card-body">
          <p>Body content</p>
          <button>Action</button>
        </div>
      </Card>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
