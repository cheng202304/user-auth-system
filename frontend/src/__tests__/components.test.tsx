import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { ProtectedRoute, PublicRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the useAuth hook
const mockLogout = jest.fn();
const mockNavigate = jest.fn();

const mockUseAuth = {
  user: {
    id: 1,
    account: '123456',
    username: 'Test User',
    email: 'test@example.com',
    role: 'student',
    status: 1,
    created_at: '2024-01-01',
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: mockLogout,
  clearError: jest.fn(),
  refreshUser: jest.fn(),
};

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Redirecting to {to}</div>,
}));

describe('DashboardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.isLoading = false;
    mockUseAuth.user = {
      id: 1,
      account: '123456',
      username: 'Test User',
      email: 'test@example.com',
      role: 'student',
      status: 1,
      created_at: '2024-01-01',
    };
  });

  it('renders user information', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome, Test User/)).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows loading spinner when isLoading is true', () => {
    mockUseAuth.isLoading = true;

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Loading spinner should be present
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays user role', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/student/i)).toBeInTheDocument();
  });

  it('displays active status', () => {
    mockUseAuth.user = {
      ...mockUseAuth.user,
      status: 1,
    };

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Active/)).toBeInTheDocument();
  });

  it('displays disabled status', () => {
    mockUseAuth.user = {
      ...mockUseAuth.user,
      status: 0,
    };

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Disabled/)).toBeInTheDocument();
  });
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.isLoading = false;
    mockUseAuth.isAuthenticated = true;
  });

  it('renders children when authenticated', () => {
    mockUseAuth.isAuthenticated = true;

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.isAuthenticated = false;

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to \/login/)).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseAuth.isLoading = true;
    mockUseAuth.isAuthenticated = false;

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects to custom path when not authenticated', () => {
    mockUseAuth.isAuthenticated = false;

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute redirectTo="/custom">
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Redirecting to \/custom/)).toBeInTheDocument();
  });
});

describe('PublicRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.isLoading = false;
    mockUseAuth.isAuthenticated = false;
  });

  it('renders children when not authenticated', () => {
    mockUseAuth.isAuthenticated = false;

    render(
      <BrowserRouter>
        <AuthProvider>
          <PublicRoute>
            <div data-testid="public-content">Public Content</div>
          </PublicRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('public-content')).toBeInTheDocument();
  });

  it('redirects to dashboard when already authenticated', () => {
    mockUseAuth.isAuthenticated = true;

    render(
      <BrowserRouter>
        <AuthProvider>
          <PublicRoute>
            <div data-testid="public-content">Public Content</div>
          </PublicRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to \/dashboard/)).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseAuth.isLoading = true;

    render(
      <BrowserRouter>
        <AuthProvider>
          <PublicRoute>
            <div data-testid="public-content">Public Content</div>
          </PublicRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects to custom path when authenticated', () => {
    mockUseAuth.isAuthenticated = true;

    render(
      <BrowserRouter>
        <AuthProvider>
          <PublicRoute redirectTo="/custom">
            <div data-testid="public-content">Public Content</div>
          </PublicRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Redirecting to \/custom/)).toBeInTheDocument();
  });
});
