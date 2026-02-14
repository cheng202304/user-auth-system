# 用户认证系统 API 接口文档

## 目录

- [接口概览](#接口概览)
- [认证接口](#认证接口)
- [用户接口](#用户接口)
- [管理员接口](#管理员接口)
- [错误响应](#错误响应)

---

## 接口概览

| 基础 URL | 版本 |
|---------|------|
| `http://localhost:3000/api` | v1 |

### 认证方式

除公开接口外，所有接口需要在请求头中携带 Token：

```
Authorization: Bearer <token>
```

### 响应格式

**成功响应：**
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

**失败响应：**
```json
{
  "success": false,
  "error": "错误信息"
}
```

---

## 认证接口

### 1. 用户注册

**接口地址：** `POST /auth/register`

**请求参数：** 无（自动生成账号）

**响应示例：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "account": "123456",
    "password": "123456",
    "role": "student"
  }
}
```

---

### 2. 用户登录

**接口地址：** `POST /auth/login`

**请求参数：**
```json
{
  "account": "000000",
  "password": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| account | string | 是 | 6位数字账号 |
| password | string | 是 | 登录密码 |

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "account": "000000",
      "username": "超级管理员",
      "role": "super_admin",
      "avatar": null
    }
  }
}
```

**错误响应：**
- 账号不存在：`{"success": false, "error": "账号或密码错误"}`
- 密码错误：`{"success": false, "error": "账号或密码错误"}`
- 账号已锁定：`{"success": false, "error": "账号已锁定，请30分钟后再试"}`

---

### 3. 用户登出

**接口地址：** `POST /auth/logout`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

### 4. 获取登录状态

**接口地址：** `GET /auth/status`

**请求参数：** 无

**响应示例（已登录）：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "isAuthenticated": true,
    "user": {
      "id": 1,
      "account": "000000",
      "username": "超级管理员",
      "role": "super_admin",
      "avatar": null
    }
  }
}
```

**响应示例（未登录）：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "isAuthenticated": false,
    "user": null
  }
}
```

---

## 用户接口

### 5. 获取个人信息

**接口地址：** `GET /profile`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "id": 1,
    "account": "000000",
    "username": "超级管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "role": "super_admin",
    "avatar": null,
    "status": 1,
    "created_at": "2025-02-10 00:00:00",
    "updated_at": "2025-02-10 00:00:00"
  }
}
```

---

### 6. 更新个人信息

**接口地址：** `PUT /profile`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "username": "新用户名",
  "email": "new@example.com",
  "phone": "13900139000"
}
```

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| username | string | 否 | 用户名（2-20字符） |
| email | string | 否 | 邮箱（需符合邮箱格式） |
| phone | string | 否 | 手机号（11位数字） |

**响应示例：**
```json
{
  "success": true,
  "message": "更新成功"
}
```

---

### 7. 修改密码

**接口地址：** `POST /profile/change-password`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "oldPassword": "123456",
  "newPassword": "newpassword123"
}
```

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| oldPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码（至少6位） |

**响应示例：**
```json
{
  "success": true,
  "message": "密码修改成功，请重新登录"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "原密码错误"
}
```

---

## 管理员接口

> 需要管理员权限

### 8. 获取用户列表

**接口地址：** `GET /admin/users`

**请求头：** `Authorization: Bearer <token>`

**查询参数：**
```
?page=1&pageSize=20&role=student&status=1&keyword=张三
```

| 参数 | 类型 | 说明 |
|-----|------|------|
| page | number | 页码（默认1） |
| pageSize | number | 每页数量（默认20） |
| role | string | 角色筛选（admin/teacher/student） |
| status | number | 状态筛选（1-正常，0-禁用） |
| keyword | string | 关键字（用户名模糊搜索） |

**响应示例：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 2,
        "account": "123456",
        "username": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138001",
        "role": "student",
        "status": 1,
        "created_at": "2025-02-10 00:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

---

### 9. 创建用户

**接口地址：** `POST /admin/users`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "username": "李四",
  "email": "lisi@example.com",
  "phone": "13800138002",
  "role": "student"
}
```

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| username | string | 是 | 用户名（2-20字符） |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| role | string | 是 | 角色（teacher/student） |

**响应示例：**
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 3,
    "account": "123457",
    "password": "123456"
  }
}
```

---

### 10. 更新用户

**接口地址：** `PUT /admin/users/:id`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "username": "新姓名",
  "email": "newemail@example.com",
  "role": "teacher",
  "status": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| username | string | 否 | 用户名 |
| email | string | 否 | 邮箱 |
| role | string | 否 | 角色 |
| status | number | 否 | 状态（1-正常，0-禁用） |

**响应示例：**
```json
{
  "success": true,
  "message": "更新成功"
}
```

---

### 11. 删除用户

**接口地址：** `DELETE /admin/users/:id`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "success": true,
  "message": "删除成功"
}
```

**错误响应：**
- 超级管理员不能删除：
```json
{
  "success": false,
  "error": "超级管理员账号不能被删除"
}
```

---

### 12. 重置用户密码

**接口地址：** `POST /admin/users/:id/reset-password`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "success": true,
  "message": "密码已重置为 123456"
}
```

---

## 错误响应

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 错误码说明

| 错误信息 | 说明 |
|---------|------|
| 账号或密码错误 | 登录失败 |
| 账号已锁定，请30分钟后再试 | 登录失败5次后锁定 |
| Token无效 | Token验证失败 |
| Token已过期 | Token过期需要重新登录 |
| 权限不足 | 需要更高权限 |
| 超级管理员账号不能被删除 | 操作禁止 |
| 系统账号已满，请联系管理员 | 注册失败 |

---

## 数据类型

### 用户角色

| 值 | 说明 |
|-----|------|
| super_admin | 超级管理员 |
| admin | 管理员 |
| teacher | 教师 |
| student | 学生 |

### 用户状态

| 值 | 说明 |
|-----|------|
| 1 | 正常 |
| 0 | 禁用 |

---

**文档版本**: 1.0.0
**创建日期**: 2026-02-14
