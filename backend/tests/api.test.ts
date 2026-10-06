import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db/prisma';

describe('Project Management System API Tests', () => {
  let userToken: string;
  let userId: string;
  let createdProjectId: string;
  let createdTaskId: string;

  const testUser = {
    fullName: 'Test Developer',
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123'
  };

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data if created
    if (userId) {
      await prisma.user.deleteMany({ where: { email: testUser.email } });
    }
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      
      userToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should prevent registering duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Conflict');
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fetch current authenticated user info', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should reject request with invalid or missing token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('Project Management Endpoints', () => {
    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Mobile App Revamp',
          description: 'Redesigning user experience for cross-platform app',
          status: 'In Progress',
          startDate: '2026-10-01',
          endDate: '2026-12-31'
        });

      expect(res.status).toBe(201);
      expect(res.body.project).toHaveProperty('id');
      expect(res.body.project.name).toBe('Mobile App Revamp');

      createdProjectId = res.body.project.id;
    });

    it('should fetch user projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeGreaterThan(0);
    });

    it('should fetch project details by ID', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.project.id).toBe(createdProjectId);
    });
  });

  describe('Task Management Endpoints', () => {
    it('should create a task under the project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Design Wireframes',
          description: 'Create Figma screens for mobile UI',
          priority: 'High',
          status: 'In Progress',
          dueDate: '2026-10-15',
          projectId: createdProjectId
        });

      expect(res.status).toBe(201);
      expect(res.body.task).toHaveProperty('id');
      expect(res.body.task.name).toBe('Design Wireframes');

      createdTaskId = res.body.task.id;
    });

    it('should update task status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'Completed'
        });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('Completed');
    });

    it('should filter tasks by status and priority', async () => {
      const res = await request(app)
        .get('/api/tasks?status=Completed&priority=High')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBe(1);
    });
  });

  describe('Dashboard Endpoints', () => {
    it('should fetch dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats).toHaveProperty('totalProjects', 1);
      expect(res.body.stats).toHaveProperty('totalTasks', 1);
      expect(res.body.stats).toHaveProperty('completedTasks', 1);
    });
  });
});
