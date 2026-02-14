import { Database } from 'sqlite3';
import { UserRepository } from '../repositories/user.repository';
import { User, CreateUserData, UpdateUserData, UserFilters, UserListResult, UserRole, UserStatus } from '../models/user.model';

/**
 * Account generator service
 */
class AccountGenerator {
  private readonly RESERVED_ACCOUNT = '000000'; // Super admin account
  private readonly ACCOUNT_LENGTH = 6;
  private readonly MAX_ATTEMPTS = 100;

  /**
   * Generate a random 6-digit account number
   * Ensures uniqueness and excludes reserved account
   */
  async generateAccount(userRepository: UserRepository): Promise<string> {
    let account: string;
    let attempts = 0;

    do {
      account = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(this.ACCOUNT_LENGTH, '0');

      attempts++;

      if (attempts >= this.MAX_ATTEMPTS) {
        throw new Error('系统账号已满，请联系管理员');
      }
    } while (await userRepository.accountExists(account) || account === this.RESERVED_ACCOUNT);

    return account;
  }
}

/**
 * User Service - business logic for user operations
 */
export class UserService {
  private userRepository: UserRepository;
  private accountGenerator: AccountGenerator;

  constructor(private db: Database) {
    this.userRepository = new UserRepository(db);
    this.accountGenerator = new AccountGenerator();
  }

  /**
   * Get repository instance
   */
  get repository(): UserRepository {
    return this.userRepository;
  }

  /**
   * Register new user (auto-generate account)
   */
  async registerUser(username: string, password: string, email?: string, phone?: string): Promise<User> {
    const account = await this.accountGenerator.generateAccount(this.userRepository);

    const userData: CreateUserData = {
      account,
      password,
      username,
      email,
      phone,
      role: UserRole.STUDENT,
    };

    return this.userRepository.create(userData);
  }

  /**
   * Create user with specific role (admin only)
   */
  async createUser(
    username: string,
    password: string,
    role: UserRole = UserRole.STUDENT,
    email?: string,
    phone?: string
  ): Promise<User> {
    const account = await this.accountGenerator.generateAccount(this.userRepository);

    const userData: CreateUserData = {
      account,
      password,
      username,
      email,
      phone,
      role,
    };

    return this.userRepository.create(userData);
  }

  /**
   * Get user by account
   */
  async getUserByAccount(account: string): Promise<User | null> {
    return this.userRepository.findByAccount(account);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Get paginated user list
   */
  async getUserList(
    page: number,
    pageSize: number,
    filters?: UserFilters
  ): Promise<UserListResult> {
    return this.userRepository.findAll(page, pageSize, filters);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    id: number,
    username?: string,
    email?: string,
    phone?: string,
    avatar?: string
  ): Promise<void> {
    const updateData: UpdateUserData = {};

    if (username !== undefined) {
      if (username.length < 2 || username.length > 20) {
        throw new Error('用户名长度必须在2-20个字符之间');
      }

      // Check if username is already taken by another user
      const existingUser = await this.userRepository.findByUsername(username);
      if (existingUser && existingUser.id !== id) {
        throw new Error('用户名已被使用');
      }

      updateData.username = username;
    }

    if (email !== undefined) {
      if (email && !this.isValidEmail(email)) {
        throw new Error('邮箱格式不正确');
      }

      // Check if email is already taken by another user
      if (email && await this.userRepository.emailExists(email, id)) {
        throw new Error('邮箱已被使用');
      }

      updateData.email = email;
    }

    if (phone !== undefined) {
      if (phone && !this.isValidPhone(phone)) {
        throw new Error('手机号必须为11位数字');
      }

      // Check if phone is already taken by another user
      if (phone && await this.userRepository.phoneExists(phone, id)) {
        throw new Error('手机号已被使用');
      }

      updateData.phone = phone;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    await this.userRepository.update(id, updateData);
  }

  /**
   * Change user password
   */
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('用户不存在');
    }

    // Verify old password (this should be done with bcrypt comparison in auth service)
    // For now, we'll assume password verification happens before calling this method

    if (newPassword.length < 6) {
      throw new Error('新密码长度至少6位');
    }

    await this.userRepository.update(id, { password: newPassword });
  }

  /**
   * Reset user password to default (admin only)
   */
  async resetUserPassword(id: number, defaultPassword: string = '123456'): Promise<void> {
    await this.userRepository.update(id, { password: defaultPassword });
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(id: number, role: UserRole): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('用户不存在');
    }

    // Prevent modifying super admin
    if (user.account === '000000') {
      throw new Error('不能修改超级管理员账号');
    }

    await this.userRepository.update(id, { role });
  }

  /**
   * Update user status (enable/disable)
   */
  async updateUserStatus(id: number, status: UserStatus): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('用户不存在');
    }

    // Prevent disabling super admin
    if (user.account === '000000' && status === UserStatus.DISABLED) {
      throw new Error('不能禁用超级管理员账号');
    }

    await this.userRepository.update(id, { status });
  }

  /**
   * Delete user
   */
  async deleteUser(id: number, currentUserRole: UserRole): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('用户不存在');
    }

    // Prevent deleting super admin
    if (user.account === '000000') {
      throw new Error('不能删除超级管理员账号');
    }

    // Admin cannot delete other admins (only super admin can)
    if (currentUserRole === UserRole.ADMIN && user.role === UserRole.ADMIN) {
      throw new Error('管理员不能删除其他管理员');
    }

    await this.userRepository.delete(id);
  }

  /**
   * Handle failed login attempt
   */
  async handleFailedLogin(account: string): Promise<boolean> {
    const user = await this.userRepository.findByAccount(account);

    if (!user) {
      return false;
    }

    await this.userRepository.incrementFailedAttempts(account);

    // Lock account after 5 failed attempts
    if (user.failed_attempts >= 4) { // Already at 4, this is the 5th attempt
      await this.userRepository.lockAccount(account, 30); // Lock for 30 minutes
      return true;
    }

    return false;
  }

  /**
   * Handle successful login (reset failed attempts)
   */
  async handleSuccessfulLogin(account: string): Promise<void> {
    await this.userRepository.resetFailedAttempts(account);
  }

  /**
   * Check if account is locked
   */
  async checkAccountLock(account: string): Promise<boolean> {
    return this.userRepository.isAccountLocked(account);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate username format
   */
  async isUsernameTaken(username: string, excludeId?: number): Promise<boolean> {
    const existingUser = await this.userRepository.findByUsername(username);
    if (!existingUser) {
      return false;
    }
    return excludeId ? existingUser.id !== excludeId : true;
  }

  /**
   * Check if email is available
   */
  async isEmailAvailable(email: string, excludeId?: number): Promise<boolean> {
    return !(await this.userRepository.emailExists(email, excludeId));
  }

  /**
   * Check if phone is available
   */
  async isPhoneAvailable(phone: string, excludeId?: number): Promise<boolean> {
    return !(await this.userRepository.phoneExists(phone, excludeId));
  }
}

/**
 * Database service - main entry point for database operations
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database | null = null;
  private userService: UserService | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   */
  async initialize(db: Database): Promise<void> {
    this.db = db;
    this.userService = new UserService(db);
  }

  /**
   * Get user service
   */
  getUserService(): UserService {
    if (!this.userService) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.userService;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db!.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            this.userService = null;
            resolve();
          }
        });
      });
    }
  }
}
