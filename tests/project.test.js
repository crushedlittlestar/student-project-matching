const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Category = require('../src/models/category.model');
const Skill = require('../src/models/skill.model');
const Project = require('../src/models/project.model');

let mongoServer;

const OWNER_ID = new mongoose.Types.ObjectId().toString();
const OTHER_STUDENT_ID = new mongoose.Types.ObjectId().toString();
const ADMIN_ID = new mongoose.Types.ObjectId().toString();

const tokenFor = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'dev-secret');

const ownerAuth = () => `Bearer ${tokenFor(OWNER_ID, 'student')}`;
const otherAuth = () => `Bearer ${tokenFor(OTHER_STUDENT_ID, 'student')}`;
const adminAuth = () => `Bearer ${tokenFor(ADMIN_ID, 'admin')}`;

let category;
let skills;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 300000);

afterAll(async () => {
  await mongoose.disconnect();
    if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Promise.all([
    Category.deleteMany({}),
    Skill.deleteMany({}),
    Project.deleteMany({}),
  ]);
  category = await Category.create({ name: 'Web Development' });
  skills = await Skill.insertMany([{ name: 'Node.js' }, { name: 'React' }]);
});

const basePayload = () => ({
  title: 'Online Learning Platform',
  description: 'A platform where students can enroll in peer-led courses.',
  category: category._id.toString(),
  requiredSkills: skills.map((s) => s._id.toString()),
  maxMembers: 3,
});

describe('POST /api/projects', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/projects').send(basePayload());
    expect(res.status).toBe(401);
  });

  it('rejects maxMembers < 2', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', ownerAuth())
      .send({ ...basePayload(), maxMembers: 1 });
    expect(res.status).toBe(400);
    expect(res.body.errors.join(' ')).toMatch(/maxMembers/);
  });

  it('rejects an empty requiredSkills array', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', ownerAuth())
      .send({ ...basePayload(), requiredSkills: [] });
    expect(res.status).toBe(400);
  });

  it('rejects a category that does not exist', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', ownerAuth())
      .send({ ...basePayload(), category: new mongoose.Types.ObjectId().toString() });
    expect(res.status).toBe(400);
  });

  it('creates a project owned by the requester, status Open, count 1', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', ownerAuth())
      .send(basePayload());
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('OPEN');
    expect(res.body.data.currentMembersCount).toBe(1);
    expect(res.body.data.owner).toBe(OWNER_ID);
  });
});

describe('Ownership rules — only the owner or Admin can update/delete a project', () => {
  let project;
  beforeEach(async () => {
    project = await Project.create({
      title: 'AI Study Buddy',
      description: 'An app that helps students form study groups by topic.',
      category: category._id,
      owner: OWNER_ID,
      requiredSkills: skills.map((s) => s._id),
      maxMembers: 4,
    });
  });

  it('blocks a non-owner (non-admin) student from updating a project', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}`)
      .set('Authorization', otherAuth())
      .send({ title: 'Hijacked Title' });
    expect(res.status).toBe(403);
  });

  it('blocks a non-owner (non-admin) student from deleting a project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', otherAuth());
    expect(res.status).toBe(403);
  });

  it('allows the owner to update their own project', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}`)
      .set('Authorization', ownerAuth())
      .send({ title: 'AI Study Buddy 2.0' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('AI Study Buddy 2.0');
  });

  it('allows the owner to delete their own project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', ownerAuth());
    expect(res.status).toBe(204);
  });

  it('allows an Admin to update someone else\'s project', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}`)
      .set('Authorization', adminAuth())
      .send({ title: 'Moderated Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Moderated Title');
  });

  it('allows an Admin to delete someone else\'s project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', adminAuth());
    expect(res.status).toBe(204);
  });
});

describe('Status state machine — OPEN -> IN_PROGRESS -> COMPLETED, no skipping', () => {
  let project;
  beforeEach(async () => {
    project = await Project.create({
      title: 'Peer Tutoring Marketplace',
      description: 'Connects students who need tutoring with peer tutors.',
      category: category._id,
      owner: OWNER_ID,
      requiredSkills: skills.map((s) => s._id),
      maxMembers: 2,
    });
  });

  it('starts as OPEN', () => {
    expect(project.status).toBe('OPEN');
  });

  it('rejects OPEN -> COMPLETED directly', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(409);
  });

  it('allows OPEN -> IN_PROGRESS', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('allows IN_PROGRESS -> COMPLETED', async () => {
    await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'IN_PROGRESS' });

    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('COMPLETED is terminal — cannot transition out of it', async () => {
    await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'IN_PROGRESS' });
    await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'COMPLETED' });

    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(409);
  });

  it('a completed project cannot be edited', async () => {
    await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'IN_PROGRESS' });
    await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'COMPLETED' });

    const res = await request(app)
      .patch(`/api/projects/${project._id}`)
      .set('Authorization', ownerAuth())
      .send({ title: 'Trying to edit a finished project' });
    expect(res.status).toBe(409);
  });

  it('blocks a non-owner (non-admin) from changing status', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', otherAuth())
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(403);
  });

  it('allows an Admin to change status', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', adminAuth())
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('rejects an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', ownerAuth())
      .send({ status: 'BOGUS' });
    expect(res.status).toBe(400);
  });
});

describe('syncMembershipCount integration point (used by Applications/Teams module)', () => {
  it('increments currentMembersCount when a member joins', async () => {
    const project = await Project.create({
      title: 'Campus Marketplace App',
      description: 'A buy/sell marketplace scoped to campus students only.',
      category: category._id,
      owner: OWNER_ID,
      requiredSkills: skills.map((s) => s._id),
      maxMembers: 2,
    });

    const service = require('../src/services/project.service');
    const updated = await service.syncMembershipCount(project._id, +1);
    expect(updated.currentMembersCount).toBe(2);
  });

  it('decrements currentMembersCount when a member leaves', async () => {
    const project = await Project.create({
      title: 'Campus Marketplace App 2',
      description: 'A buy/sell marketplace scoped to campus students only.',
      category: category._id,
      owner: OWNER_ID,
      requiredSkills: skills.map((s) => s._id),
      maxMembers: 2,
      currentMembersCount: 2,
    });

    const service = require('../src/services/project.service');
    const updated = await service.syncMembershipCount(project._id, -1);
    expect(updated.currentMembersCount).toBe(1);
  });
});

describe('Delete rules', () => {
  it('blocks deleting a project that already has teammates — must Cancel instead', async () => {
    const project = await Project.create({
      title: 'Group Project With Teammates',
      description: 'Already has more than just the owner on the team.',
      category: category._id,
      owner: OWNER_ID,
      requiredSkills: skills.map((s) => s._id),
      maxMembers: 3,
      currentMembersCount: 2,
    });

    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', ownerAuth());
    expect(res.status).toBe(409);
  });

  it('allows deleting a project that still only has the owner', async () => {
    const project = await Project.create({
      title: 'Solo So Far Project',
      description: 'Just created, nobody has joined yet besides the owner.',
      category: category._id,
      owner: OWNER_ID,
      requiredSkills: skills.map((s) => s._id),
      maxMembers: 3,
    });

    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', ownerAuth());
    expect(res.status).toBe(204);
  });
});

describe('GET /api/projects filtering', () => {
  beforeEach(async () => {
    await Project.create([
      {
        title: 'Node.js Chat App',
        description: 'Real-time chat app built with sockets and Node.js.',
        category: category._id,
        owner: OWNER_ID,
        requiredSkills: [skills[0]._id],
        maxMembers: 3,
      },
      {
        title: 'React Portfolio Builder',
        description: 'Drag-and-drop portfolio builder for students.',
        category: category._id,
        owner: OWNER_ID,
        requiredSkills: [skills[1]._id],
        maxMembers: 3,
      },
    ]);
  });

  it('filters by skill', async () => {
    const res = await request(app).get(`/api/projects?skill=${skills[0]._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Node.js Chat App');
  });

  it('paginates results', async () => {
    const res = await request(app).get('/api/projects?limit=1&page=1');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.pages).toBe(2);
  });
});
