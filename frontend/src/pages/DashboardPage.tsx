import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 仪表盘页面组件
 * 受保护路由 - 仅登录后可访问
 */
export function DashboardPage(): JSX.Element {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 根据角色确定显示内容
  const renderUserRoleContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              管理员功能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/profile" 
                className="btn btn-secondary py-3 text-center"
              >
                用户管理
              </Link>
              <Link 
                to="/profile" 
                className="btn btn-secondary py-3 text-center"
              >
                系统设置
              </Link>
            </div>
          </div>
        );
      case 'teacher':
        return (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              教师功能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/profile" 
                className="btn btn-secondary py-3 text-center"
              >
                课程管理
              </Link>
              <Link 
                to="/profile" 
                className="btn btn-secondary py-3 text-center"
              >
                学生管理
              </Link>
            </div>
          </div>
        );
      case 'student':
        return (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              学生功能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/profile" 
                className="btn btn-secondary py-3 text-center"
              >
                我的课程
              </Link>
              <Link 
                to="/profile" 
                className="btn btn-secondary py-3 text-center"
              >
                学习进度
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          用户认证系统
        </Link>
        <div className="navbar-nav">
          <Link to="/profile" className="btn-link">
            个人中心
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            退出
          </button>
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="container py-8">
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            欢迎回来，{user?.username}！
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                账户信息
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-600">账号</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.account}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">用户名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">邮箱</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">角色</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.role === 'super_admin' && '超级管理员'}
                    {user?.role === 'admin' && '管理员'}
                    {user?.role === 'teacher' && '教师'}
                    {user?.role === 'student' && '学生'}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                账户状态
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-600">状态</dt>
                  <dd className="mt-1">
                    {user?.status === 1 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        正常
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        已禁用
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">注册时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* 角色特定功能 */}
        {renderUserRoleContent()}

        {/* 快速操作 */}
        <div className="card mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            快速操作
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link 
              to="/profile" 
              className="btn btn-secondary py-3 text-center"
            >
              修改个人信息
            </Link>
            <Link 
              to="/profile" 
              className="btn btn-secondary py-3 text-center"
            >
              修改密码
            </Link>
            <Link 
              to="/profile" 
              className="btn btn-secondary py-3 text-center"
            >
              上传头像
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
