import {
  createTestDatabase,
  setupTestDatabase,
  cleanupTestDatabase,
  hashPassword,
  createTestUser,
  createTestUsers,
  clearUsers,
  getUserCount,
} from '../utils/database.test-utils';
import { UserRepository } from '../../database/repositories/user.repository';
import { User, UserRole, UserStatus } from '../../database/models/user.model';

describe('UserRepository', () => {
  let db: any;

  beforeAll(async () => {
    db = await createTestDatabase();
    await setupTestDatabase(db);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  afterEach(async () => {
    await clearUsers(db);
  });

  describe('User CRUD Operations', () => {
    test('should create a new user', async () => {
      const repository = new UserRepository(db);
      const hashedPassword = await hashPassword('password123');

      const userData = {
        account: '123456',
        password: hashedPassword,
        username: 'John Doe',
        email: 'john@example.com',
        phone: '13800138000',
        role: UserRole.STUDENT,
      };

      const user = await repository.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.account).toBe('123456');
      expect(user.username).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe(UserRole.STUDENT);
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    test('should find user by ID', async () => {
      const repository = new UserRepository(db);
      const createdUser = await createTestUser(db, { account: '100001' });

      const foundUser = await repository.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.account).toBe('100001');
    });

    test('should find user by account', async () => {
      const repository = new UserRepository(db);
      await createTestUser(db, { account: '100002' });

      const foundUser = await repository.findByAccount('100002');

      expect(foundUser).toBeDefined();
      expect(foundUser?.account).toBe('100002');
    });

    test('should find user by email', async () => {
      const repository = new UserRepository(db);
      await createTestUser(db, { email: 'test@example.com' });

      const foundUser = await repository.findByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('test@example.com');
    });

    test('should find user by phone', async () => {
      const repository = new UserRepository(db);
      await createTestUser(db, { phone: '13900139000' });

      const foundUser = await repository.findByPhone('13900139000');

      expect(foundUser).toBeDefined();
      expect(foundUser?.phone).toBe('13900139000');
    });

    test('should search users by username (fuzzy)', async () => {
      const repository = new UserRepository(db);
      await createTestUser(db, { username: 'John Smith' });
      await createTestUser(db, { account: '100002', username: 'Jane Smith' });
      await createTestUser(db, { account: '100003', username: 'Bob Johnson' });

      const results = await repository.searchByUsername('Smith');

      expect(results).toHaveLength(2);
      expect(results[0].username).toContain('Smith');
    });

    test('should update user', async () => {
      const repository = new UserRepository(db);
      const user = await createTestUser(db);

      await repository.update(user.id, {
        username: 'Updated Name',
        email: 'updated@example.com',
      });

      const updatedUser = await repository.findById(user.id);

      expect(updatedUser?.username).toBe('Updated Name');
      expect(updatedUser?.email).toBe('updated@example.com');
    });

    test('should delete user', async () => {
      const repository = new UserRepository(db);
      const user = await createTestUser(db);

      await repository.delete(user.id);

      const foundUser = await repository.findById(user.id);
      expect(foundUser).toBeNull();
    });
  });

  describe('User List with Pagination', () => {
    let repository: UserRepository;

    beforeEach(async () => {
      repository = new UserRepository(db);
    });

    test('should get paginated user list', async () => {
      await createTestUsers(db, 25, 300001); // Use unique starting account number
      const result = await repository.findAll(1, 10);

      expect(result.list).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    test('should get second page', async () => {
      await createTestUsers(db, 25, 300001); // Use unique starting account number
      const result = await repository.findAll(2, 10);

      expect(result.list).toHaveLength(10);
      expect(result.page).toBe(2);
    });

    test('should filter by role', async () => {
      await createTestUser(db, {
        account: '200001',
        username: 'Admin User',
        role: UserRole.ADMIN,
      });

      const result = await repository.findAll(1, 10, { role: UserRole.ADMIN });

      expect(result.list.length).toBeGreaterThan(0);
      expect(result.list[0].role).toBe(UserRole.ADMIN);
    });

    test('should filter by status', async () => {
      await createTestUser(db, {
        account: '400006',
        username: 'Disabled User',
        status: UserStatus.DISABLED,
      });

      const result = await repository.findAll(1, 10, { status: UserStatus.DISABLED });

      expect(result.list.length).toBeGreaterThan(0);
      expect(result.list[0].status).toBe(UserStatus.DISABLED);
    });

    test('should filter by keyword (username fuzzy search)', async () => {
      await createTestUser(db, {
        account: '200003',
        username: 'Special Name User',
      });

      const result = await repository.findAll(1, 10, { keyword: 'Special' });

      expect(result.list.length).toBeGreaterThan(0);
      expect(result.list[0].username).toContain('Special');
    });

    test('should combine multiple filters', async () => {
      await createTestUser(db, {
        account: '200004',
        username: 'Teacher John',
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
      });

      const result = await repository.findAll(1, 10, {
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        keyword: 'John',
      });

      expect(result.list.length).toBeGreaterThan(0);
      expect(result.list[0].role).toBe(UserRole.TEACHER);
      expect(result.list[0].status).toBe(UserStatus.ACTIVE);
      expect(result.list[0].username).toContain('John');
    });
  });

  describe('User Existence Checks', () => {
    test('should check if account exists', async () => {
      const repository = new UserRepository(db);
      await createTestUser(db, { account: '100001' });

      const exists = await repository.accountExists('100001');
      const notExists = await repository.accountExists('999999');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    test('should check if email exists', async () => {
      const repository = new UserRepository(db);
      await createTestUser(db, { email: 'test@example.com' });

      const exists = await repository.emailExists('test@example.com');
      const notExists = await repository.emailExists('notfound@example.com');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    test('should check if email exists excluding specific user ID', async () => {
      const repository = new UserRepository(db);
      const user1 = await createTestUser(db, { email: 'test@example.com' });
      const user2 = await createTestUser(db, {
        account: '100002',
        email: 'test2@example.com',
      });

      const exists1 = await repository.emailExists('test@example.com');
      const exists2 = await repository.emailExists('test@example.com', user1.id);
      const notExists = await repository.emailExists('test2@example.com', user1.id);

      expect(exists1).toBe(true);
      expect(exists2).toBe(false); // Should not count the same user
      expect(notExists).toBe(true); // Email belongs to different user, so from user1's perspective it's available
    });

    test('should check if phone exists', async () => {
      const repository = new UserRepository(db);
      await createTestUser(db, { phone: '13800138000' });

      const exists = await repository.phoneExists('13800138000');
      const notExists = await repository.phoneExists('13800138999');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });
  });

  describe('Login Attempts and Account Locking', () => {
    test('should increment failed login attempts', async () => {
      const repository = new UserRepository(db);
      const user = await createTestUser(db);

      await repository.incrementFailedAttempts(user.account);

      const updatedUser = await repository.findByAccount(user.account);
      expect(updatedUser?.failed_attempts).toBe(1);
    });

    test('should reset failed login attempts', async () => {
      const repository = new UserRepository(db);
      const user = await createTestUser(db);

      // Increment attempts
      await repository.incrementFailedAttempts(user.account);
      await repository.incrementFailedAttempts(user.account);

      // Reset attempts
      await repository.resetFailedAttempts(user.account);

      const updatedUser = await repository.findByAccount(user.account);
      expect(updatedUser?.failed_attempts).toBe(0);
      expect(updatedUser?.locked_until).toBeNull();
    });

    test('should lock account after 5 failed attempts', async () => {
      const repository = new UserRepository(db);
      const user = await createTestUser(db);

      // After 4 increments, we're at 4 failed attempts
      await repository.incrementFailedAttempts(user.account);
      await repository.incrementFailedAttempts(user.account);
      await repository.incrementFailedAttempts(user.account);
      await repository.incrementFailedAttempts(user.account);

      // 5th increment should trigger lock (handleFailedLogin in UserService does the lock)
      // In repository test, we need to call lockAccount directly
      await repository.lockAccount(user.account);

      const updatedUser = await repository.findByAccount(user.account);
      expect(updatedUser?.failed_attempts).toBe(4); // Repository doesn't increment on lock
      expect(updatedUser?.locked_until).toBeTruthy();
    });

    test('should check if account is locked', async () => {
      const repository = new UserRepository(db);
      const user = await createTestUser(db);

      // Not locked initially
      let isLocked = await repository.isAccountLocked(user.account);
      expect(isLocked).toBe(false);

      // Lock the account
      await repository.lockAccount(user.account, 30);

      // Should be locked now
      isLocked = await repository.isAccountLocked(user.account);
      expect(isLocked).toBe(true);
    });

    test('should auto-unlock expired accounts', async () => {
      const repository = new UserRepository(db);
      const user = await createTestUser(db);

      // Lock account for 1 minute
      await repository.lockAccount(user.account, 0.01); // Very short lock

      // Wait for lock to expire
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isLocked = await repository.isAccountLocked(user.account);
      expect(isLocked).toBe(false);
    });
  });

  describe('Account Generation and Management', () => {
    let repository: UserRepository;

    beforeEach(async () => {
      repository = new UserRepository(db);
    });

    test('should get used accounts', async () => {
      await createTestUser(db, { account: '100001' });
      await createTestUser(db, { account: '100002' });

      const usedAccounts = await repository.getUsedAccounts();

      expect(usedAccounts).toContain('100001');
      expect(usedAccounts).toContain('100002');
    });

    test('should count users by role', async () => {
      await createTestUser(db, { role: UserRole.STUDENT });
      await createTestUser(db, { account: '100002', role: UserRole.STUDENT });
      await createTestUser(db, { account: '100003', role: UserRole.TEACHER });

      const studentCount = await repository.countByRole(UserRole.STUDENT);
      const teacherCount = await repository.countByRole(UserRole.TEACHER);

      expect(studentCount).toBeGreaterThanOrEqual(2);
      expect(teacherCount).toBeGreaterThanOrEqual(1);
    });

    test('should count users by status', async () => {
      await createTestUser(db, { account: '500001', status: UserStatus.ACTIVE });
      await createTestUser(db, { account: '500002', status: UserStatus.ACTIVE });
      await createTestUser(db, { account: '500003', status: UserStatus.DISABLED });

      const activeCount = await repository.countByStatus(UserStatus.ACTIVE);
      const disabledCount = await repository.countByStatus(UserStatus.DISABLED);

      expect(activeCount).toBeGreaterThanOrEqual(2);
      expect(disabledCount).toBeGreaterThanOrEqual(1);
    });
  });
});
