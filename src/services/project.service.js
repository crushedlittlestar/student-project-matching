const Project = require('../models/project.model');
const Category = require('../models/category.model');
const Skill = require('../models/skill.model'); 
require('../models/user.model'); 
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/apiFeatures');

async function assertCategoryExists(categoryId) {
  const category = await Category.findById(categoryId);
  if (!category || category.status !== 'Active') {
    throw new ApiError(400, 'category does not exist or is inactive');
  }
}

async function assertSkillsExist(skillIds) {
  const found = await Skill.find({ _id: { $in: skillIds } });
  if (found.length !== new Set(skillIds.map(String)).size) {
    throw new ApiError(400, 'one or more requiredSkills do not exist');
  }
}

// Rule: only the project owner OR an Admin can update/delete a project.
function assertIsOwnerOrAdmin(project, user) {
  const isOwner = project.owner.toString() === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Only the project owner or an admin can do this');
  }
  return { isOwner, isAdmin };
}

const createProject = async (userId, payload) => {
  await assertCategoryExists(payload.category);
  await assertSkillsExist(payload.requiredSkills);

  return Project.create({
    title: payload.title.trim(),
    description: payload.description.trim(),
    category: payload.category,
    owner: userId,
    requiredSkills: payload.requiredSkills,
    maxMembers: payload.maxMembers,
    deadline: payload.deadline,
    image: payload.image,
    status: 'OPEN',
    currentMembersCount: 1, // the owner
  });
};

const listProjects = async (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.skill) {
    const skillIds = query.skill.split(',');
    filter.requiredSkills = { $in: skillIds };
  }

  const features = new ApiFeatures(Project.find(filter), query)
    .search(['title', 'description'])
    .sort()
    .paginate();

  const [projects, total] = await Promise.all([
    features.query.populate('owner', 'name email').populate('category', 'name'),
    features.countQuery(Project),
  ]);

  return {
    data: projects,
    meta: {
      total,
      page: features.pagination.page,
      limit: features.pagination.limit,
      pages: Math.ceil(total / features.pagination.limit),
    },
  };
};

const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate('owner', 'name email')
    .populate('category', 'name')
    .populate('requiredSkills', 'name');
  if (!project) throw new ApiError(404, 'Project not found');
  return project;
};

const updateProject = async (id, user, payload) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  assertIsOwnerOrAdmin(project, user);

  if (project.status === 'COMPLETED') {
    throw new ApiError(409, 'A completed project cannot be edited');
  }

  if (payload.category) await assertCategoryExists(payload.category);
  if (payload.requiredSkills) await assertSkillsExist(payload.requiredSkills);

  // Shrinking maxMembers below the current team size would silently strand
  // members already on the team — block it instead.
  if (payload.maxMembers !== undefined && payload.maxMembers < project.currentMembersCount) {
    throw new ApiError(
      400,
      `maxMembers cannot be less than the current team size (${project.currentMembersCount})`
    );
  }

  Object.assign(project, payload);
  await project.save();
  return project;
};

// Owner/Admin-triggered manual transitions. Kept separate from the generic
// updateProject() because these carry stricter rules than a plain field
// edit — see the state machine docs in project.model.js.
// Status can only move OPEN -> IN_PROGRESS -> COMPLETED, no skipping
// (e.g. OPEN -> COMPLETED directly is rejected).
const changeStatus = async (id, user, targetStatus) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  assertIsOwnerOrAdmin(project, user);

  if (!Project.canTransition(project.status, targetStatus)) {
    throw new ApiError(
      409,
      `Cannot move project from "${project.status}" to "${targetStatus}"`
    );
  }

  project.status = targetStatus;
  await project.save();
  return project;
};

const deleteProject = async (id, user) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  assertIsOwnerOrAdmin(project, user);

  // A project that already has teammates isn't safe to hard-delete — those
  // students would lose their team with no record of why.
  if (project.currentMembersCount > 1) {
    throw new ApiError(
      409,
      'This project already has team members and cannot be deleted'
    );
  }

  await project.deleteOne();
};

/**
 * INTEGRATION POINT for Member 4 (Applications) and Member 5 (Teams).
 * Call this after an application is accepted (delta = +1) or a member
 * leaves / is removed (delta = -1). Keeps currentMembersCount in sync,
 * bounded between 1 and maxMembers, no matter which module triggers it.
 */
const syncMembershipCount = async (projectId, delta) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const nextCount = project.currentMembersCount + delta;
  if (nextCount < 1 || nextCount > project.maxMembers) {
    throw new ApiError(409, 'Membership count out of bounds for this project');
  }

  project.currentMembersCount = nextCount;
  await project.save();
  return project;
};

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  changeStatus,
  deleteProject,
  syncMembershipCount,
};
