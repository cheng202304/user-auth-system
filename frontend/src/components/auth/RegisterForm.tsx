import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { authApi, RegisterData, ApiError } from '../../api/auth';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    username: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof RegisterData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
    ) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Username validation (optional but if provided)
    if (formData.username && formData.username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    } else if (formData.username && formData.username.length > 20) {
      newErrors.username = 'Username must be at most 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      await authApi.register(formData);
      setAlert({
        type: 'success',
        message: 'Registration successful! You can now login.',
      });
      // Clear form
      setFormData({ email: '', password: '', username: '' });
    } catch (error: any) {
      const errData = error.response?.data as ApiError;
      if (errData?.details) {
        // Handle validation errors from backend
        const newErrors: Partial<Record<keyof RegisterData, string>> = {};
        errData.details.forEach((detail) => {
          newErrors[detail.field as keyof RegisterData] = detail.message;
        });
        setErrors(newErrors);
        setAlert({
          type: 'error',
          message: errData.error || 'Registration failed. Please check your input.',
        });
      } else {
        setAlert({
          type: 'error',
          message: errData?.error || 'Registration failed. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          autoClose={true}
        />
      )}
      <form className="register-form" onSubmit={handleSubmit}>
        <FormInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          error={errors.email}
          required
        />

        <FormInput
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Enter your username (optional)"
          error={errors.username}
        />

        <FormInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="register-button"
        >
          Register
        </Button>
      </form>

      <div className="form-footer">
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
