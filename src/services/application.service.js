const Application = require("../models/application.model");
const Project = require("../models/project.model");
const ApiError = require("../utils/ApiError");
const {
  syncMembershipCount,
} = require("./project.service");


/**
 * Create a new application for a project
 */
const createApplication = async (userId, projectId, message) => {
  // 1. Check if project exists
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 2. Project must be OPEN
  if (project.status !== "OPEN") {
    throw new ApiError(
      400,
      "Applications are only allowed for open projects"
    );
  }

  // 3. Project owner cannot apply to their own project
  if (project.owner.toString() === userId.toString()) {
    throw new ApiError(
      400,
      "Project owner cannot apply to their own project"
    );
  }

  // 4. Check if the student already applied
  const existingApplication = await Application.findOne({
    project: projectId,
    applicant: userId,
  });

  if (existingApplication) {
    throw new ApiError(
      409,
      "You have already applied to this project"
    );
  }

  // 5. Create application
  const application = await Application.create({
    project: projectId,
    applicant: userId,
    message,
    status: "PENDING",
  });

  return application;
};


/**
 * Get applications submitted by the current student
 */
const getMyApplications = async (userId, query = {}) => {
  const filter = {
    applicant: userId,
  };

  // Optional status filter
  if (query.status) {
    filter.status = query.status.toUpperCase();
  }

  const applications = await Application.find(filter)
    .populate("project", "title description status maxMembers")
    .populate("applicant", "name email")
    .sort({ createdAt: -1 });

  return applications;
};


/**
 * Get all applications for a specific project
 * Only the project owner is allowed to see them.
 */
const getProjectApplications = async (
  userId,
  projectId,
  query = {}
) => {
  // 1. Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 2. Check owner
  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Only the project owner can view applications"
    );
  }

  // 3. Build filter
  const filter = {
    project: projectId,
  };

  if (query.status) {
    filter.status = query.status.toUpperCase();
  }

  // 4. Get applications
  const applications = await Application.find(filter)
    .populate("applicant", "name email")
    .sort({ createdAt: -1 });

  return applications;
};


/**
 * Accept an application
 */
const acceptApplication = async (userId, applicationId) => {
  // 1. Find application
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // 2. Find project
  const project = await Project.findById(application.project);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 3. Only project owner can accept
  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Only the project owner can accept applications"
    );
  }

  // 4. Application must be pending
  if (application.status !== "PENDING") {
    throw new ApiError(
      409,
      "Only pending applications can be accepted"
    );
  }

  // 5. Check team capacity
  if (project.currentMembersCount >= project.maxMembers) {
    throw new ApiError(
      409,
      "Project team is already full"
    );
  }

  // 6. Accept application
  application.status = "ACCEPTED";
  await application.save();

  // 7. Increase current team members count
  await syncMembershipCount(project._id, 1);

  return application;
};


/**
 * Reject an application
 */
const rejectApplication = async (userId, applicationId) => {
  // 1. Find application
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // 2. Find project
  const project = await Project.findById(application.project);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 3. Only project owner can reject
  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Only the project owner can reject applications"
    );
  }

  // 4. Application must be pending
  if (application.status !== "PENDING") {
    throw new ApiError(
      409,
      "Only pending applications can be rejected"
    );
  }

  // 5. Reject
  application.status = "REJECTED";
  await application.save();

  return application;
};


/**
 * Withdraw an application
 */
const withdrawApplication = async (userId, applicationId) => {
  // 1. Find application
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // 2. Only the applicant can withdraw
  if (application.applicant.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Only the applicant can withdraw this application"
    );
  }

  // 3. Only pending applications can be withdrawn
  if (application.status !== "PENDING") {
    throw new ApiError(
      409,
      "Only pending applications can be withdrawn"
    );
  }

  // 4. Withdraw
  application.status = "WITHDRAWN";
  await application.save();

  return application;
};


module.exports = {
  createApplication,
  getMyApplications,
  getProjectApplications,
  acceptApplication,
  rejectApplication,
  withdrawApplication,
};