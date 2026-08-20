const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");

const {
  createApplication,
  getMyApplications,
  getProjectApplications,
  acceptApplication,
  rejectApplication,
  withdrawApplication,
} = require("../controllers/application.controller");

// POST /api/projects/:projectId/applications
router.post(
  "/projects/:projectId/applications",
  authenticate,
  createApplication
);

// GET /api/applications/me
router.get(
  "/applications/me",
  authenticate,
  getMyApplications
);

// GET /api/projects/:projectId/applications
router.get(
  "/projects/:projectId/applications",
  authenticate,
  getProjectApplications
);

// PATCH /api/applications/:id/accept
router.patch(
  "/applications/:id/accept",
  authenticate,
  acceptApplication
);

// PATCH /api/applications/:id/reject
router.patch(
  "/applications/:id/reject",
  authenticate,
  rejectApplication
);

// DELETE /api/applications/:id
router.delete(
  "/applications/:id",
  authenticate,
  withdrawApplication
);
console.log("Application routes loaded");
module.exports = router;