import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * 用户管理页面组件（管理员专用）
 */
export function AdminUserManagementPage(): JSX.Element {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    keyword: ''
  });

  // 模拟用户数据
  const mockUsers = [
    {
      id: 1,
      account: '000000',
      username: '超级管理员',
      email: 'admin@example.com',
      role: 'super_admin',
      status: 1,
      created_at: '2025-02-10T00:00:00Z'
    },
    {
      id: 2,
      account: '123456',
      username: '张三',
      email: 'zhangsan@example.com',
      role: 'student',
      status: 1,
      created_at: '2025-02-10T00:00:00Z'
    },
    {
      id: 3,
      account: '123457',
      username: '李四',
      email: 'lisi@example.com',
      role: 'teacher',
      status: 1,
      created_at: '2025-02-10T00:00:00Z'
    },
    {
      id: 4,
      account: '123458',
      username: '王五',
      email: 'wangwu@example.com',
      role: 'admin',
      status: 0,
      created_at: '2025-02-10T00:00:00Z'
    }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status.toString() === filters.status;
    const matchesKeyword = !filters.keyword || 
      user.username.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      user.account.includes(filters.keyword) ||
      user.email.toLowerCase().includes(filters.keyword.toLowerCase());
    
    return matchesRole && matchesStatus && matchesKeyword;
  });

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin': return '超级管理员';
      case 'admin': return '管理员';
      case 'teacher': return '教师';
      case 'student': return '学生';
      default: return role;
    }
  };

  const getStatusDisplay = (status: number) => {
    return status === 1 ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        正常
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        已禁用
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          用户认证系统
        </Link>
        <div className="navbar-nav">
          <Link to="/dashboard" className="btn-link">
            返回仪表盘
          </Link>
        </div>
      </nav>

      <main className="container py-8">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              用户管理
            </h1>
            <button className="btn btn-primary">
              添加用户
            </button>
          </div>

          {/* 筛选条件 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="form-label block mb-1">角色筛选</label>
              <select 
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="form-input w-full"
              >
                <option value="">全部角色</option>
                <option value="super_admin">超级管理员</option>
                <option value="admin">管理员</option>
                <option value="teacher">教师</option>
                <option value="student">学生</option>
              </select>
            </div>
            
            <div>
              <label className="form-label block mb-1">状态筛选</label>
              <select 
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-input w-full"
              >
                <option value="">全部状态</option>
                <option value="1">正常</option>
                <option value="0">已禁用</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="form-label block mb-1">关键词搜索</label>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="账号、用户名或邮箱"
                className="form-input w-full"
              />
            </div>
          </div>

          {/* 用户列表 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">账号</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">用户名</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">邮箱</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">角色</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">状态</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">注册时间</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{user.account}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{user.username}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{getRoleDisplay(user.role)}</td>
                    <td className="py-3 px-4 text-sm">{getStatusDisplay(user.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          编辑
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              显示 1-4 条，共 4 条
            </div>
            <div className="flex space-x-2">
              <button className="btn btn-secondary" disabled>
                上一页
              </button>
              <button className="btn btn-primary">
                下一页
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}