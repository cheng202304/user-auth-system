import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 首页组件 - 游客可访问的公共页面
 */
export function HomePage(): JSX.Element {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          用户认证系统
        </Link>
        
        <div className="navbar-nav">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-secondary">
                登录
              </Link>
              <Link to="/register" className="btn btn-primary">
                注册
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="btn-link">
                个人中心
              </Link>
              <button 
                onClick={() => {
                  // 这里需要调用登出功能，但目前在HomePage中无法直接访问
                  // 实际实现时需要通过context或props传递
                  navigate('/login');
                }}
                className="btn btn-secondary"
              >
                退出
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 主体内容区 */}
      <main className="container py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">
            欢迎使用用户认证系统
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            安全可靠的用户注册登录系统，支持多角色管理和完整的用户生命周期管理。
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="btn btn-primary px-6 py-3 text-lg"
              >
                立即登录
              </Link>
              <Link 
                to="/register" 
                className="btn btn-secondary px-6 py-3 text-lg"
              >
                免费注册
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg mb-4">
                您好，{user?.username || user?.account}！
              </p>
              <Link 
                to="/dashboard" 
                className="btn btn-primary px-6 py-3 text-lg"
              >
                进入仪表盘
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 底部区域 */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-600">
        <p>© 2026 用户认证系统. 保留所有权利.</p>
      </footer>
    </div>
  );
}