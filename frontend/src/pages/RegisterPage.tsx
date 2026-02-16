import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 注册表单数据接口
 */
interface RegisterFormData {
  email: string;
  password: string;
  username: string;
}

/**
 * 表单错误接口
 */
interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
}

/**
 * 注册页面组件
 */
export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    username: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 组件卸载时清除错误
   */
  React.useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // 用户名验证
    if (!formData.username) {
      errors.username = '用户名不能为空';
    } else if (formData.username.length < 2 || formData.username.length > 20) {
      errors.username = '用户名长度必须在2-20个字符之间';
    }

    // 邮箱验证
    if (!formData.email) {
      errors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!formData.password) {
      errors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      errors.password = '密码长度至少6位';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 清除当前字段的错误
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // 清除认证错误
    if (error) {
      clearError();
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 card">
        {/* 头部 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            创建新账户
          </h2>
          <p className="mt-2 text-gray-600">
            已有账户？{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              立即登录
            </Link>
          </p>
        </div>

        {/* 认证错误 */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 表单 */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 用户名字段 */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${formErrors.username ? 'error' : ''}`}
                placeholder="请输入用户名"
                disabled={isSubmitting || isLoading}
              />
              {formErrors.username && (
                <p className="form-error">{formErrors.username}</p>
              )}
            </div>

            {/* 邮箱字段 */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                disabled={isSubmitting || isLoading}
              />
              {formErrors.email && (
                <p className="form-error">{formErrors.email}</p>
              )}
            </div>

            {/* 密码字段 */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${formErrors.password ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={isSubmitting || isLoading}
              />
              {formErrors.password && (
                <p className="form-error">{formErrors.password}</p>
              )}
            </div>
          </div>

          {/* 提交按钮 */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn btn-primary w-full py-2"
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="loading-spinner mr-2"></span>
                  注册中...
                </span>
              ) : (
                '注册'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}