require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const User = require('../src/models/user.model');
const Project = require('../src/models/project.model');
const Report = require('../src/models/Report.model');

let ownerToken, studentToken, adminToken;
let ownedProjectId, someProjectId, someReportId;

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  const hashedPassword = await bcrypt.hash('TestPass123', 10);

  const owner = await User.create({
    name: 'Owner Test',
    email: `owner_${Date.now()}@test.com`,
    password: hashedPassword,
    role: 'Student'
  });

  const student = await User.create({
    name: 'Student Test',
    email: `student_${Date.now()}@test.com`,
    password: hashedPassword,
    role: 'Student'
  });

  const admin = await User.create({
    name: 'Admin Test',
    email: `admin_${Date.now()}@test.com`,
    password: hashedPassword,
    role: 'Admin'
  });

  ownerToken = signToken(owner);
  studentToken = signToken(student);
  adminToken = signToken(admin);

  // Generate valid ObjectIds for referenced fields
  const mockCategoryId = new mongoose.Types.ObjectId();
  const mockSkillId = new mongoose.Types.ObjectId();

  const ownedProject = await Project.create({
    title: 'Owned Test Project',
    owner: owner._id,
    status: 'OPEN',
    description: 'A valid project description long enough to pass validation',
    category: mockCategoryId,
    maxMembers: 5,
    requiredSkills: [mockSkillId]
  });
  ownedProjectId = ownedProject._id.toString();

  const otherProject = await Project.create({
    title: 'Other Test Project',
    owner: admin._id,
    status: 'OPEN',
    description: 'Another valid project description long enough to pass validation',
    category: mockCategoryId,
    maxMembers: 3,
    requiredSkills: [mockSkillId]
  });
  someProjectId = otherProject._id.toString();

  const report = await Report.create({
    reporter: student._id,
    targetType: 'Project',
    targetId: otherProject._id,
    reason: 'seed report for resolve tests'
  });
  someReportId = report._id.toString();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await User.deleteMany({ email: /@test\.com$/ });
    await Project.deleteMany({ title: /Test Project$/ });
    await Report.deleteMany({ reason: /report/i });
    await mongoose.connection.close();
  }
});

describe('Report module', () => {

  it('blocks reporting your own project', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        targetType: 'Project',
        targetId: ownedProjectId,
        reason: 'testing self-report'
      });

    expect(res.status).toBe(400);
  });

  it('blocks reporting the same target twice', async () => {
    await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        targetType: 'Project',
        targetId: someProjectId,
        reason: 'inappropriate content'
      });

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        targetType: 'Project',
        targetId: someProjectId,
        reason: 'inappropriate again'
      });

    expect(res.status).toBe(400);
  });

  it('blocks non-admin from resolving a report', async () => {
    const res = await request(app)
      .patch(`/api/reports/${someReportId}/resolve`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ action: 'dismiss' });

    expect(res.status).toBe(403);
  });

  it('allows an admin to resolve a pending report', async () => {
    const res = await request(app)
      .patch(`/api/reports/${someReportId}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'dismiss' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Dismissed');
  });

});