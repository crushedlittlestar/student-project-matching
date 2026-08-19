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

## What's intentionally left out for MVP
- `ProjectFile` uploads — deferred per the scope note (first thing to cut if
  time runs short).
- Full-text search index — using a regex-based search for MVP; noted in
  `apiFeatures.js` as an easy upgrade path (`$text` index) later.
