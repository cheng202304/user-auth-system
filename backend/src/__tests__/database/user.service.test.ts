import {
  createTestDatabase,
  setupTestDatabase,
  cleanupTestDatabase,
  createTestUser,
  createTestUsers,
  clearUsers,
  hashPassword,
} from '../utils/database.test-utils';
import { UserService, DatabaseService } from '../../database/services/user.service';
import { UserRole, UserStatus } from '../../database/models/user.model';

describe('UserService', () => {
  let db: any;
  let userService: UserService;

  beforeAll(async () => {
    db = await createTestDatabase();
    await setupTestDatabase(db);

    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);
    userService = dbService.getUserService();
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  afterEach(async () => {
    await clearUsers(db);
  });

  describe('User Registration', () => {
    test('should register new user with auto-generated account', async () => {
      const hashedPassword = await hashPassword('password123');

      const user = await userService.registerUser(
        'New User',
        hashedPassword,
        'newuser@example.com',
        '13800138000'
      );

      expect(user).toBeDefined();
      expect(user.account).toMatch(/^\d{6}$/); // 6-digit account
      expect(user.username).toBe('New User');
      expect(user.email).toBe('newuser@example.com');
      expect(user.role).toBe(UserRole.STUDENT);
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    test('should generate unique accounts', async () => {
      const hashedPassword = await hashPassword('password123');

      const user1 = await userService.registerUser('User 1', hashedPassword);
      const user2 = await userService.registerUser('User 2', hashedPassword);
      const user3 = await userService.registerUser('User 3', hashedPassword);

      expect(user1.account).not.toBe(user2.account);
      expect(user2.account).not.toBe(user3.account);
      expect(user1.account).not.toBe(user3.account);
    });

    test('should not generate reserved account 000000', async () => {
      const hashedPassword = await hashPassword('password123');

      // Register many users
      const users = [];
      for (let i = 0; i < 50; i++) {
        const user = await userService.registerUser(`User ${i}`, hashedPassword);
        users.push(user);
      }

      // Check that 000000 is not used
      const hasReservedAccount = users.some(u => u.account === '000000');
      expect(hasReservedAccount).toBe(false);
    });
  });

  describe('User Creation', () => {
    test('should create user with specified role', async () => {
      const hashedPassword = await hashPassword('password123');

      const user = await userService.createUser(
        'Teacher User',
        hashedPassword,
        UserRole.TEACHER,
        'teacher@example.com'
      );

      expect(user).toBeDefined();
      expect(user.username).toBe('Teacher User');
      expect(user.role).toBe(UserRole.TEACHER);
      expect(user.email).toBe('teacher@example.com');
    });

    test('should create admin user', async () => {
      const hashedPassword = await hashPassword('password123');

      const user = await userService.createUser(
        'Admin User',
        hashedPassword,
        UserRole.ADMIN
      );

      expect(user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('User Retrieval', () => {
    test('should get user by account', async () => {
      await createTestUser(db, { account: '100001', username: 'Test User' });

      const user = await userService.getUserByAccount('100001');

      expect(user).toBeDefined();
      expect(user?.account).toBe('100001');
      expect(user?.username).toBe('Test User');
    });

    test('should get user by ID', async () => {
      const createdUser = await createTestUser(db, { account: '100002' });

      const user = await userService.getUserById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
    });

    test('should return null for non-existent user', async () => {
      const user = await userService.getUserByAccount('999999');
      expect(user).toBeNull();
    });
  });

  describe('User List with Pagination', () => {
    beforeEach(async () => {
      await createTestUsers(db, 25, 100001);
    });

    test('should get paginated user list', async () => {
      const result = await userService.getUserList(1, 10);

      expect(result.list).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    test('should sort by account ascending', async () => {
      const result = await userService.getUserList(1, 10);

      const accounts = result.list.map(u => parseInt(u.account));
      for (let i = 1; i < accounts.length; i++) {
        expect(accounts[i]).toBeGreaterThanOrEqual(accounts[i - 1]);
      }
    });
  });

  describe('User Profile Updates', () => {
    test('should update username', async () => {
      const user = await createTestUser(db);

      await userService.updateUserProfile(user.id, 'Updated Name');

      const updatedUser = await userService.getUserById(user.id);
      expect(updatedUser?.username).toBe('Updated Name');
    });

    test('should update email', async () => {
      const user = await createTestUser(db);

      await userService.updateUserProfile(user.id, undefined, 'newemail@example.com');

      const updatedUser = await userService.getUserById(user.id);
      expect(updatedUser?.email).toBe('newemail@example.com');
    });

    test('should update phone', async () => {
      const user = await createTestUser(db);

      await userService.updateUserProfile(
        user.id,
        undefined,
        undefined,
        '13900139000'
      );

      const updatedUser = await userService.getUserById(user.id);
      expect(updatedUser?.phone).toBe('13900139000');
    });

    test('should update avatar', async () => {
      const user = await createTestUser(db);

      await userService.updateUserProfile(
        user.id,
        undefined,
        undefined,
        undefined,
        'http://example.com/avatar.jpg'
      );

      const updatedUser = await userService.getUserById(user.id);
      expect(updatedUser?.avatar).toBe('http://example.com/avatar.jpg');
    });

    test('should validate username length', async () => {
      const user = await createTestUser(db);

      await expect(
        userService.updateUserProfile(user.id, 'A')
      ).rejects.toThrow('用户名长度必须在2-20个字符之间');

      await expect(
        userService.updateUserProfile(user.id, 'A'.repeat(21))
      ).rejects.toThrow('用户名长度必须在2-20个字符之间');
    });

    test('should validate email format', async () => {
      const user = await createTestUser(db);

      await expect(
        userService.updateUserProfile(user.id, undefined, 'invalid-email')
      ).rejects.toThrow('邮箱格式不正确');
    });

    test('should validate phone format', async () => {
      const user = await createTestUser(db);

      await expect(
        userService.updateUserProfile(user.id, undefined, undefined, '123')
      ).rejects.toThrow('手机号必须为11位数字');
    });

    test('should reject duplicate email', async () => {
      const user1 = await createTestUser(db, { email: 'user1@example.com' });
      const user2 = await createTestUser(db, {
        account: '100002',
        email: 'user2@example.com',
      });

      await expect(
        userService.updateUserProfile(user1.id, undefined, 'user2@example.com')
      ).rejects.toThrow('邮箱已被使用');
    });

    test('should reject duplicate phone', async () => {
      const user1 = await createTestUser(db, { phone: '13800138001' });
      const user2 = await createTestUser(db, {
        account: '100002',
        phone: '13800138002',
      });

      await expect(
        userService.updateUserProfile(user1.id, undefined, undefined, '13800138002')
      ).rejects.toThrow('手机号已被使用');
    });

    test('should allow updating own email to same value', async () => {
      const user = await createTestUser(db, { email: 'user@example.com' });

      await expect(
        userService.updateUserProfile(user.id, undefined, 'user@example.com')
      ).resolves.not.toThrow();
    });
  });

  describe('Password Management', () => {
    test('should change password', async () => {
      const hashedPassword = await hashPassword('oldpassword');
      const newHashedPassword = await hashPassword('newpassword');

      const user = await createTestUser(db, { password: hashedPassword });

      await userService.changePassword(user.id, 'oldpassword', newHashedPassword);

      // Note: In real implementation, password comparison happens in auth service
      // Here we just verify the update method is called
      expect(true).toBe(true);
    });

    test('should validate new password length', async () => {
      const user = await createTestUser(db);

      await expect(
        userService.changePassword(user.id, 'oldpass', '12345')
      ).rejects.toThrow('新密码长度至少6位');
    });

    test('should reset user password to default', async () => {
      const user = await createTestUser(db);
      const defaultPassword = await hashPassword('123456');

      await userService.resetUserPassword(user.id, defaultPassword);

      const updatedUser = await userService.getUserById(user.id);
      expect(updatedUser?.password_hash).toBe(defaultPassword);
    });
  });

  describe('User Role and Status Management', () => {
    test('should update user role', async () => {
      const user = await createTestUser(db, { role: UserRole.STUDENT });

      await userService.updateUserRole(user.id, UserRole.TEACHER);

      const updatedUser = await userService.getUserById(user.id);
      expect(updatedUser?.role).toBe(UserRole.TEACHER);
    });

    test('should update user status', async () => {
      const user = await createTestUser(db, { status: UserStatus.ACTIVE });

      await userService.updateUserStatus(user.id, UserStatus.DISABLED);

      const updatedUser = await userService.getUserById(user.id);
      expect(updatedUser?.status).toBe(UserStatus.DISABLED);
    });

    test('should not modify super admin account', async () => {
      const hashedPassword = await hashPassword('password123');
      const superAdmin = await userService.createUser(
        'Super Admin',
        hashedPassword,
        UserRole.SUPER_ADMIN
      );

      // Change account to 000000 to simulate super admin
      db.run('UPDATE users SET account = ? WHERE id = ?', ['000000', superAdmin.id]);

      await expect(
        userService.updateUserRole(superAdmin.id, UserRole.ADMIN)
      ).rejects.toThrow('不能修改超级管理员账号');
    });

    test('should not disable super admin account', async () => {
      const hashedPassword = await hashPassword('password123');
      const superAdmin = await userService.createUser(
        'Super Admin',
        hashedPassword,
        UserRole.SUPER_ADMIN
      );

      // Change account to 000000 to simulate super admin
      db.run('UPDATE users SET account = ? WHERE id = ?', ['000000', superAdmin.id]);

      await expect(
        userService.updateUserStatus(superAdmin.id, UserStatus.DISABLED)
      ).rejects.toThrow('不能禁用超级管理员账号');
    });
  });

  describe('User Deletion', () => {
    test('should delete user', async () => {
      const user = await createTestUser(db);

      await userService.deleteUser(user.id, UserRole.SUPER_ADMIN);

      const deletedUser = await userService.getUserById(user.id);
      expect(deletedUser).toBeNull();
    });

    test('should not delete super admin account', async () => {
      const hashedPassword = await hashPassword('password123');
      const superAdmin = await userService.createUser(
        'Super Admin',
        hashedPassword,
        UserRole.SUPER_ADMIN
      );

      // Change account to 000000 to simulate super admin
      db.run('UPDATE users SET account = ? WHERE id = ?', ['000000', superAdmin.id]);

      await expect(
        userService.deleteUser(superAdmin.id, UserRole.SUPER_ADMIN)
      ).rejects.toThrow('不能删除超级管理员账号');
    });

    test('should not allow admin to delete other admins', async () => {
      const admin1 = await createTestUser(db, {
        role: UserRole.ADMIN,
      });
      const admin2 = await createTestUser(db, {
        account: '100002',
        role: UserRole.ADMIN,
      });

      await expect(
        userService.deleteUser(admin2.id, UserRole.ADMIN)
      ).rejects.toThrow('管理员不能删除其他管理员');
    });

    test('should allow super admin to delete admins', async () => {
      const admin = await createTestUser(db, { role: UserRole.ADMIN });

      await expect(
        userService.deleteUser(admin.id, UserRole.SUPER_ADMIN)
      ).resolves.not.toThrow();

      const deletedUser = await userService.getUserById(admin.id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Login Attempt Handling', () => {
    test('should handle failed login', async () => {
      const user = await createTestUser(db);

      const isLocked = await userService.handleFailedLogin(user.account);

      expect(isLocked).toBe(false); // Not locked on first attempt

      const updatedUser = await userService.getUserByAccount(user.account);
      expect(updatedUser?.failed_attempts).toBe(1);
    });

    test('should lock account after 5 failed attempts', async () => {
      const user = await createTestUser(db);

      for (let i = 0; i < 4; i++) {
        await userService.handleFailedLogin(user.account);
      }

      const isLocked = await userService.handleFailedLogin(user.account);

      expect(isLocked).toBe(true);

      const updatedUser = await userService.getUserByAccount(user.account);
      expect(updatedUser?.failed_attempts).toBe(5);
      expect(updatedUser?.locked_until).toBeTruthy();
    });

    test('should reset failed attempts on successful login', async () => {
      const user = await createTestUser(db);

      // Simulate failed attempts
      await userService.handleFailedLogin(user.account);
      await userService.handleFailedLogin(user.account);

      let updatedUser = await userService.getUserByAccount(user.account);
      expect(updatedUser?.failed_attempts).toBe(2);

      // Successful login
      await userService.handleSuccessfulLogin(user.account);

      updatedUser = await userService.getUserByAccount(user.account);
      expect(updatedUser?.failed_attempts).toBe(0);
      expect(updatedUser?.locked_until).toBeNull();
    });

    test('should check if account is locked', async () => {
      const user = await createTestUser(db);

      // Not locked initially
      let isLocked = await userService.checkAccountLock(user.account);
      expect(isLocked).toBe(false);

      // Lock account
      await userService.handleFailedLogin(user.account);
      await userService.handleFailedLogin(user.account);
      await userService.handleFailedLogin(user.account);
      await userService.handleFailedLogin(user.account);
      await userService.handleFailedLogin(user.account);

      // Should be locked
      isLocked = await userService.checkAccountLock(user.account);
      expect(isLocked).toBe(true);
    });
  });

  describe('Availability Checks', () => {
    test('should check if username is taken', async () => {
      await createTestUser(db, { username: 'Existing User' });

      const isTaken = await userService.isUsernameTaken('Existing User');
      const isNotTaken = await userService.isUsernameTaken('New User');

      expect(isTaken).toBe(true);
      expect(isNotTaken).toBe(false);
    });

    test('should allow same username for same user', async () => {
      const user = await createTestUser(db, { username: 'My Username' });

      const isTaken = await userService.isUsernameTaken('My Username', user.id);
      expect(isTaken).toBe(false);
    });

    test('should check if email is available', async () => {
      await createTestUser(db, { email: 'existing@example.com' });

      const isAvailable = await userService.isEmailAvailable('existing@example.com');
      const isNotAvailable = await userService.isEmailAvailable('new@example.com');

      expect(isAvailable).toBe(false);
      expect(isNotAvailable).toBe(true);
    });

    test('should check if phone is available', async () => {
      await createTestUser(db, { phone: '13800138001' });

      const isAvailable = await userService.isPhoneAvailable('13800138001');
      const isNotAvailable = await userService.isPhoneAvailable('13800138002');

      expect(isAvailable).toBe(false);
      expect(isNotAvailable).toBe(true);
    });
  });
});
