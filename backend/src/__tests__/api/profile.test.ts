import request from 'supertest';
import { app } from '../../app';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UserRole } from '../../database/models/user.model';

declare global {
  var clearDatabase: () => Promise<void>;
}

/**
 * Generate test JWT token
 */
function generateToken(userId: number, email: string, role: UserRole = UserRole.STUDENT): string {
  return jwt.sign(
    { userId, email, role },
    config.jwtSecret as jwt.Secret,
    { expiresIn: '1h' }
  );
}

describe('Profile API Tests', () => {
  let testUser: {
    id: number;
    email: string;
    account: string;
    token: string;
  };

  beforeEach(async () => {
    await clearDatabase();

    // Create test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
        username: 'Test User',
      });

    testUser = {
      id: registerResponse.body.data.id,
      email: registerResponse.body.data.email,
      account: registerResponse.body.data.account,
      token: '',
    };

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
      });

    testUser.token = loginResponse.body.data.accessToken;
  });

  describe('GET /api/profile', () => {
    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('username', 'Test User');
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/profile', () => {
    it('should update username', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          username: 'Updated Name',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('username', 'Updated Name');
    });

    it('should update email', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          email: 'newemail@example.com',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', 'newemail@example.com');
    });

    it('should update phone', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phone: '13900139000',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('phone', '13900139000');
    });

    it('should update avatar', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          avatar: 'http://example.com/avatar.jpg',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('avatar', 'http://example.com/avatar.jpg');
    });

    it('should update multiple fields at once', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          username: 'Multi Update',
          email: 'multi@example.com',
          phone: '13800138000',
          avatar: 'http://example.com/new-avatar.jpg',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('username', 'Multi Update');
      expect(response.body.data).toHaveProperty('email', 'multi@example.com');
      expect(response.body.data).toHaveProperty('phone', '13800138000');
      expect(response.body.data).toHaveProperty('avatar', 'http://example.com/new-avatar.jpg');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid phone format', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phone: '123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with username too short', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          username: 'A',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with username too long', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          username: 'A'.repeat(21),
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with duplicate email from another user', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'SecurePassword123!',
          username: 'Other User',
        });

      // Try to update with duplicate email
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          email: 'other@example.com',
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with duplicate phone from another user', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other2@example.com',
          password: 'SecurePassword123!',
          username: 'Other User 2',
          phone: '13900139001',
        });

      // Try to update with duplicate phone
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phone: '13900139001',
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Password API Tests', () => {
  let testUser: {
    id: number;
    email: string;
    token: string;
  };

  beforeEach(async () => {
    await clearDatabase();

    // Create test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'passworduser@example.com',
        password: 'SecurePassword123!',
        username: 'Password User',
      });

    testUser = {
      id: registerResponse.body.data.id,
      email: registerResponse.body.data.email,
      token: '',
    };

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'passworduser@example.com',
        password: 'SecurePassword123!',
      });

    testUser.token = loginResponse.body.data.accessToken;
  });

  describe('PUT /api/profile/password', () => {
    it('should change password with correct old password', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          oldPassword: 'SecurePassword123!',
          newPassword: 'NewSecurePassword456!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should login with new password after change', async () => {
      // Change password
      await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          oldPassword: 'SecurePassword123!',
          newPassword: 'NewSecurePassword456!',
        });

      // Try to login with old password
      const oldLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'passworduser@example.com',
          password: 'SecurePassword123!',
        })
        .expect(401);

      // Login with new password
      const newLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'passworduser@example.com',
          password: 'NewSecurePassword456!',
        })
        .expect(200);

      expect(newLoginResponse.body).toHaveProperty('success', true);
    });

    it('should fail with incorrect old password', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          oldPassword: 'WrongPassword!',
          newPassword: 'NewSecurePassword456!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with missing old password', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          newPassword: 'NewSecurePassword456!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with missing new password', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          oldPassword: 'SecurePassword123!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with new password too short', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          oldPassword: 'SecurePassword123!',
          newPassword: '12345',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .send({
          oldPassword: 'SecurePassword123!',
          newPassword: 'NewSecurePassword456!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
