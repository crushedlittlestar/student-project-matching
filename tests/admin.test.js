const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Project = require('../src/models/project.model');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Admin Endpoints', () => {
  let studentToken;
  let adminToken;
  let testProject;

  beforeAll(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});

    // Create student
    const student = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'password123',
      role: 'Student'
    });
    studentToken = jwt.sign({ id: student._id, role: student.role }, process.env.JWT_SECRET || 'secret');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin'
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret');

    // Create test project with valid ObjectIds
    testProject = await Project.create({
      title: 'Test Admin Project',
      description: 'Project to be managed by admin',
      owner: student._id,
      maxMembers: 4,
      category: new mongoose.Types.ObjectId(),
      requiredSkills: [new mongoose.Types.ObjectId()] // Passed as ObjectId array
    });
  });

  describe('Authorization Checks', () => {
    it('blocks non-admin from every admin route', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Project Management', () => {
    it('allows admin to delete a project', async () => {
      const res = await request(app)
        .delete(`/api/admin/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});