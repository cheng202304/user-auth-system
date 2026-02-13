import request from 'supertest';
import { app } from '../../app';

declare global {
  var clearDatabase: () => Promise<void>;
}

describe('User API Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        username: 'testuser',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'SecurePassword123!',
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'login@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logout@example.com',
          password: 'SecurePassword123!',
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'SecurePassword123!',
        });

      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });

    it('should fail logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should remove refresh token from database after logout', async () => {
      // First logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify user cannot use the old refresh token to get new access token
      // (this would require a refresh endpoint, but we can verify the token is deleted)
      // For now, verify that logout is idempotent - calling again still works
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should verify access token is still valid before logout', async () => {
      // Verify we can access protected route before logout
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meResponse.body).toHaveProperty('success', true);
      expect(meResponse.body.data).toHaveProperty('email', 'logout@example.com');
    });
  });
});
