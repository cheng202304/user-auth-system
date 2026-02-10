/**
 * User entity type definition
 * Matches the users table structure
 */
export interface User {
  id: number;
  account: string;
  password: string;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  failed_attempts: number;
  locked_until?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * User creation data (without auto-generated fields)
 */
export interface CreateUserData {
  account: string;
  password: string;
  username: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  avatar?: string;
  status?: UserStatus;
}

/**
 * User update data (partial update)
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  avatar?: string;
  status?: UserStatus;
  password?: string;
  failed_attempts?: number;
  locked_until?: Date | string | null;
}

/**
 * User query filters
 */
export interface UserFilters {
  account?: string;
  username?: string;
  role?: UserRole;
  status?: UserStatus;
  keyword?: string; // For fuzzy search on username
}

/**
 * User list pagination result
 */
export interface UserListResult {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Role enum values
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

/**
 * User status enum values
 */
export enum UserStatus {
  DISABLED = 0,
  ACTIVE = 1,
}

/**
 * User DTO for API responses (excludes sensitive data)
 */
export interface UserDTO {
  id: number;
  account: string;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  created_at: Date | string;
}

/**
 * Convert User entity to UserDTO (excludes password)
 */
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    account: user.account,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    created_at: user.created_at,
  };
}
