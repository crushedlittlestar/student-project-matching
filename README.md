# Student Project & Team Matching System

A backend platform for university students to create projects, find teammates
based on required skills, and manage teams — built with Node.js, Express, and MongoDB.

## Tech Stack
Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Winston/morgan, Jest, Docker, Swagger

## Setup
1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in real values
4. Run: `npm run dev`
5. API docs available at `http://localhost:5000/api-docs`

## Environment Variables
See `.env.example` for required variables (PORT, MONGO_URI, JWT_SECRET)

## Running Tests
`npm test`

## Modules
- Authentication & Users — Jana
- Projects — Hagar
- Applications — Taky
- Team & File Upload — Kawser
- Skills, Search & Matching — Mohamed
- Admin, Logging & Reports — Lina

# Member 1 — Authentication & User Management Module

Scope: User model + registration, login, JWT authentication, password hashing, profile management, and role-based authorization middleware.

This is a backend-only module built with Express and Mongoose and designed to provide the shared authentication and user functionality used across the Student Project & Team Matching System.

## Backend-only module

This module handles user account creation, secure login, authentication, profile management, and role-based authorization.

The system supports two user roles: Student and Admin. Authentication is implemented using JWT, while passwords are securely hashed before being stored in the database.

The authentication and authorization middleware provided by this module is used to protect routes across the other project modules.

## Integration contracts (read before merging)

* User model — stores the user's name, email, password, role, skills, account status, and timestamps.
* Authentication middleware — verifies JWT authentication and provides protection for routes that require a logged-in user.
* Role middleware — checks the authenticated user's role and restricts protected operations based on whether the user is a Student or Admin.
* Password hashing — user passwords must be securely hashed before being stored in MongoDB.
* JWT authentication — successful login provides authentication information used to access protected resources.
* Other modules — project, application, team, skills, and administration modules rely on the authentication and role-based authorization middleware provided here.

## Business rules enforced

* Users can register for an account.
* Users can log in securely.
* Passwords are securely hashed before being stored.
* Authentication uses JWT (JSON Web Tokens).
* Protected resources require authentication.
* The system supports two roles: Student and Admin.
* Different permissions are applied depending on the user's role.
* Protected routes verify both authentication and authorization.
* Authenticated users can view and update their own profile.
* Input validation is applied to registration and login requests.
* Invalid or incomplete requests are rejected before processing.
* Authentication and authorization errors return appropriate HTTP status codes.
* Sensitive information such as passwords and JWT secrets must not be exposed or logged.
* Authentication and authorization logic is covered by unit tests.
* Authentication and user endpoints are documented using Swagger/OpenAPI and Postman.

## User registration

New users can create an account through the registration endpoint.

The registration process validates the submitted information and securely hashes the user's password before storing the account in the database.

Users are assigned one of the supported system roles:

* Student
* Admin

The User model contains information such as the user's name, email, password, role, skills, account status, and timestamps.

## User login

Registered users can log in using their account credentials.

After successful authentication, the system uses JWT-based authentication so the user can access protected resources.

Invalid authentication attempts are rejected using the appropriate authentication error response.

## JWT authentication

JWT authentication is used to protect resources throughout the system.

The authentication middleware verifies the user's authentication information before allowing access to protected endpoints.

This middleware is shared with the other modules, including project management, applications, teams, skills, and administration.

## Role-based authorization

The system has two roles:

* Student
* Admin

Role-based authorization ensures that users can only access functionality permitted for their role.

For example, administrative operations are protected so that only users with the Admin role can access them.

## Profile management

Authenticated users can view and update their own profile.
The profile functionality is exposed through the user endpoints and is protected by authentication.

## Endpoints

| Method | Route                | Access        |
| ------ | -------------------- | ------------- |
| POST   | /api/auth/register | Public        |
| POST   | /api/auth/login    | Public        |
| GET    | /api/users/me      | Authenticated |
| PATCH  | /api/users/me      | Authenticated |

## Module responsibilities

This module is responsible for:

* User registration
* User login
* JWT authentication
* Password hashing
* User profile retrieval
* User profile updates
* Student/Admin role management
* Authentication middleware
* Role-based authorization middleware
* Authentication and user input validation
* Authentication error handling
* Unit tests for authentication and authorization
* Swagger/OpenAPI documentation
* Postman documentation/testing

Project management, applications, team management, skills, search/filtering, administration, logging, and file uploads are handled by the other project modules.

## Security

Security is a core responsibility of this module.

The authentication system uses:

* JWT authentication
* Secure password hashing
* Role-based authorization
* Server-side request validation
* Protected routes
* Proper authorization checks
* Rate limiting on sensitive endpoints such as login and registration
* Environment variables for sensitive configuration

Database credentials and JWT secrets must not be committed to GitHub or exposed in application logs.

[8/21/2026 12:14 PM] Lina: # Member 2 — Skills, Search & Student Profiles Module

Scope: Skill model + CRUD, student skill management, student search/filter/pagination, profile viewing, and profile picture upload.

This is a backend-only module built with Express and Mongoose and designed to integrate with the shared authentication and user modules.

## Backend-only module

This module handles skill management and student profile functionality. Students can manage the skills attached to their profiles, search for other students based on skills, view student profiles, and upload profile pictures.

Admins manage the available skills, while authenticated users can use the student and profile features.

## Integration contracts (read before merging)

* Authentication middleware — all endpoints in this module require authentication. The authentication middleware must provide the authenticated user's ID and role through req.user.
* Role middleware — skill creation, updating, and deletion require the Admin role.
* User model — the Profile model references the shared User model. Student search and profile endpoints populate the user's name.
* Skill model — student profiles store references to skills instead of duplicating skill information.
* Profile model — each user can have one profile. A profile is automatically created when needed if one does not already exist.

## Business rules enforced

* Only Admin users can create, update, or delete skills.
* Authenticated users can retrieve the list of active skills.
* Skill names are required and cannot contain only whitespace.
* Duplicate skill names are rejected when creating a skill.
* Students can only add skills that already exist.
* A student cannot add the same skill to their profile more than once.
* Invalid skill IDs are rejected.
* Student profiles are automatically created when required.
* Student search can filter by one skill or multiple comma-separated skills.
* Skill-name search is case-insensitive.
* Student search supports pagination with a default limit of 10 and a maximum limit of 50.
* Student profile responses include the student's name and populated skills.
* Profile pictures are limited to .jpg, .jpeg, .png, and .webp.
* Profile picture uploads have a maximum size of 2 MB.
* Uploaded profile pictures are given unique filenames based on the user ID and upload timestamp.

## Student search

Students can be searched using either a single skill or multiple skills.

The search endpoint supports:

* skill — filter by one skill name.
* skills — filter by multiple comma-separated skill names.
* page — page number, defaults to 1.
* limit — results per page, defaults to 10 and is limited to a maximum of 50.

Search results include pagination information such as the total number of matching students, current page, and total pages.

## Profile picture upload

Authenticated users can upload or update their profile picture.

Images are stored in the profile-picture uploads directory and the resulting file path is saved in the student's profile.

Only supported image extensions are accepted, and uploads larger than 2 MB are rejected.

## Endpoints

| Method | Route                           | Access                                                      |
| ------ | ------------------------------- | ----------------------------------------------------------- |
| GET    | /api/skills                   | Authenticated                                               |
| POST   | /api/skills                   | Admin                                                       |
| PATCH  | /api/skills/:id               | Admin                                                       |
| DELETE | /api/skills/:id               | Admin                                                       |
[8/21/2026 12:14 PM] Lina: | GET    | /api/users/me/skills          | Authenticated                                               |
| POST   | /api/users/me/skills          | Authenticated                                               |
| DELETE | /api/users/me/skills/:skillId | Authenticated                                               |
| GET    | /api/students                 | Authenticated — filters: skill, skills, page, limit |
| GET    | /api/students/:id             | Authenticated                                               |
| PATCH  | /api/users/me/profile-picture | Authenticated — multipart field: picture                  |

## Module responsibilities

This module is responsible for:

* Skill management
* Student skill management
* Student profile data
* Student search by skills
* Search pagination
* Student profile retrieval
* Profile picture uploads

Project management, applications, teams, authentication, and other system functionality are handled by the other project modules.

# Member 3 — Project Management Module

Scope: `Project` model + CRUD, `Category` model + CRUD, search/filter/pagination.
This is a standalone, runnable slice — `npm install && npm test` — so it can be
merged into the shared repo without breaking anything.

## Backend-only module
This is a pure backend slice — Express + Mongoose, no frontend included.
All requests go through the API (routes → controller → service → model),
and all data is persisted to MongoDB via the Mongoose models.

```bash
npm install
npm test          # jest + supertest + mongodb-memory-server, no real DB needed
npm start          # needs a real MongoDB at MONGO_URI (defaults to localhost)
```

## Integration contracts (read before merging)
- **`src/middleware/auth.middleware.js`** — a minimal stand-in for Member 1's
  real auth. Delete it and import theirs, as long as it sets
  `req.user = { id, role }` and throws 401/403 the same way.
- **`src/modules/projects/skill.model.stub.js`** — a minimal stand-in for
  Member 2's real `Skill` model. Delete it and import theirs — only `name`
  and `_id` are used here.
- **`project.service.js` → `syncMembershipCount(projectId, delta)`** — Member 4
  (Applications) calls this with `+1` when an application is accepted, and
  Member 5 (Teams) calls it with `-1` when a member leaves/is removed. Keeps
  `currentMembersCount` in sync, bounded between 1 and `maxMembers`.

## Status state machine (be ready to defend this in the discussion)

| From          | To            | Who can trigger it |
|---------------|---------------|---------------------|
| OPEN          | IN_PROGRESS   | Owner or Admin |
| IN_PROGRESS   | COMPLETED     | Owner or Admin |
| OPEN          | COMPLETED     | **Not allowed — no skipping** |
| COMPLETED     | —             | Terminal, no transitions out |

Why:
- **Strictly linear.** A project has to actually be in progress before it can
  be marked done — jumping straight from `OPEN` to `COMPLETED` would let the
  status lie about whether any work happened.
- **Only the project owner or an Admin can manage a project** (edit, change
  status, delete). Admin is a moderation override on top of the normal
  owner-gated endpoints, not a separate route set.

## Business rules enforced (not just CRUD)
- `maxMembers` must be an integer between 2–20; can't be lowered below the
  current team size (would strand members already accepted).
- `requiredSkills` must be a non-empty array of skills that actually exist.
- `category` must reference an existing, `Active` category.
- Only the project owner or an Admin can update/change status/delete a project.
- Hard `DELETE` is only allowed while the project still has just the owner
  (`currentMembersCount === 1`) — once teammates have joined, deleting is
  blocked (409) so the rest of the team isn't silently orphaned.
- A `COMPLETED` project rejects further edits.
- Category deletion is blocked while any project still references it (must
  be set `Inactive` instead) — avoids dangling references.

## Explicit non-goals of this module (owned elsewhere)
- Matching score / skill-overlap percentage → Member 5 (Teams & Matching).
  This module exposes clean, filterable data (`requiredSkills`, `category`,
  `status`) for that algorithm to consume — it doesn't compute the score
  itself, to keep responsibilities separated per the team split.
- Accepting/rejecting applicants → Member 4. This module only reacts to that
  outcome via `syncMembershipCount`.
- Who's actually on the team (`Team`/`TeamMember`) → Member 5.

## Endpoints

| Method | Route | Access |
|---|---|---|
| GET | `/api/projects` | Public — filters: `search`, `category`, `status`, `skill` (comma-separated ids), `page`, `limit`, `sort` |
| POST | `/api/projects` | Student |
| GET | `/api/projects/:id` | Public |
| PATCH | `/api/projects/:id` | Owner or Admin |
| DELETE | `/api/projects/:id` | Owner or Admin, blocked once teammates exist |
| PATCH | `/api/projects/:id/status` | Owner or Admin — body `{ status }`, enforces OPEN → IN_PROGRESS → COMPLETED |
| GET | `/api/categories` | Public |
| POST/PATCH/DELETE | `/api/categories(/:id)` | Admin |
# Member 4 - Applications Module

## Overview

The Applications Module is responsible for managing student applications to projects.

Students can apply to projects, view their applications, and withdraw them. Project owners can view applications submitted to their projects and accept or reject them.

## Features

- Create a project application
- View the authenticated student's applications
- View applications submitted to a project
- Accept an application
- Reject an application
- Withdraw an application
- JWT authentication
- Input validation
- Error handling
- Application status management
- MongoDB persistence using Mongoose

## Application Status

Applications use the following statuses:

- `PENDING`
- `ACCEPTED`
- `REJECTED`

The normal application flow is:

```text
PENDING → ACCEPTED
PENDING → REJECTED

## What's intentionally left out for MVP
- `ProjectFile` uploads — deferred per the scope note (first thing to cut if
  time runs short).
- Full-text search index — using a regex-based search for MVP; noted in
  `apiFeatures.js` as an easy upgrade path (`$text` index) later.


## MEMBER 6 - AAdmin & Report Module

### Owned by: Lina Yasser Sakr

#### Overview

This module provides two things: an administrative layer for managing users, projects, applications, and skills, and a Report/Moderation system that lets any authenticated user flag a project or user as inappropriate for admin review. It also contributes the app's centralized error handling, logging, and response formatting used across the whole API.

### Entities

#### Report

Field	Type	Notes:

- reporter	ObjectId (ref: User)	who submitted the report
- targetType	String, enum: Project, User	what kind of thing is being reported
- targetId	ObjectId	the specific document being reported
reason	String, 5–500 chars	why it was reported
- status	String, enum: Pending, Reviewed, Dismissed	default Pending
- resolvedBy	ObjectId (ref: User)	which admin resolved it, null until resolved

- A compound unique index on (reporter, targetType, targetId) prevents the same user from reporting the same target more than once — enforced at the database level, not with a manual check, to avoid race conditions.

### Business Rules: 

- A user cannot report their own project.
- A user cannot submit a duplicate report against the same target.
- Only reports with status Pending can be resolved; already-resolved reports are locked.
- Admin routes are fully blocked (403) for any non-admin, regardless of authentication.
- Every admin action (user update/delete, project delete, application delete, skill delete, report resolution) is logged with the acting admin's id and a timestamp.

### Endpoints

#### Reports

Method	Route	      Access	      Description
POST	 /api/reports	Authenticated	Submit a report against a Project or User
GET	   /api/reports	Admin	        List reports (defaults to Pending)
PATCH	 /api/reports/:id/resolve	Admin	Dismiss a report or take action (e.g. delete the reported project)
GET	/api/reports/analytics	Admin	 Platform-wide stats: total users, projects, applications by status, acceptance rate

#### Admin

Method	Route         	       Access	    Description
GET	   /api/admin/users	       Admin	List all users
PATCH	 /api/admin/users/:id	   Admin	Update a user's role or blocked status
GET	   /api/admin/projects	   Admin	List all projects
DELETE /api/admin/projects/:id Admin	Delete a project
GET	   /api/admin/applications Admin	List applications, optional ?status= filter
DELETE /api/admin/applications/:id	Admin	 Delete an application
DELETE /api/admin/skills/:id	Admin	      Delete a skill

All admin routes require a valid JWT and the Admin role, enforced via router.use(authenticate, authorize('Admin')) at the top of admin.routes.js, applied once to every route in the file.

### Error Handling & Logging
Custom AppError/ApiError classes attach an HTTP status code to thrown errors, handled by a centralized error-handling middleware so every failure across the API returns a consistent JSON shape.
Winston-based logger writes to the console and to logs/combined.log (all events) / logs/error.log (errors only). Passwords and tokens are never logged.
morgan logs every incoming HTTP request through the same logger.
Testing

### Automated Jest + Supertest tests cover:

Non-admin blocked from admin routes (403)
Admin successfully accessing admin routes (200)
Self-report rejected (400)
Duplicate report rejected (400)
Non-admin blocked from resolving a report (403)
Admin successfully resolving a report (200)

### Run with:
 npm test 

#### Files
src/controllers/admin.controller.js
src/controllers/report.controller.js
src/routes/admin.routes.js
src/routes/report.routes.js
src/middlewares/report.middleware.js
src/models/Report.model.js
src/services/report.service.js
src/utils/AppError.js
src/utils/logger.js
src/utils/ResponseHandler.js
src/middlewares/error.middleware.js
src/tests/admin.test.js
src/tests/report.test.js 
