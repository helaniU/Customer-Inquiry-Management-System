# Architectural Decisions & Technical Analysis

**Project:** Customer Inquiry Management System
**Organization:** Coffee Ninja (Pvt) Ltd

---

## 1. Core Assumptions

- **Target Audience:** Internal cafe staff working across two roles — Agents (frontline staff who record inquiries) and Admins (managers who handle and resolve them).
- **Authentication Model:** Workspace personnel use pre-provisioned seeded accounts. Registration is intentionally disabled to maintain controlled internal access.
- **Data Flow:** Inquiries follow a structured lifecycle (`NEW` → `IN_PROGRESS` → `RESOLVED`), with explicit permission for admins to reopen resolved items when customer follow-up is needed.
- **Ownership:** All signed-in staff can view all inquiries (shared workspace model). This keeps coordination transparent without requiring complex per-record ACLs.

---

## 2. Key Design Decisions

### A. Role-Based Status Control

**Decision:** Only `ADMIN` users can change inquiry status. Agents can submit and view but not modify lifecycle state.

**Reasoning:** In a service business, agents collect inquiries and admins triage and resolve them. Allowing agents to change status would create inconsistent states (e.g., an agent accidentally resolving an open issue). The rule is enforced by the `requireRole(['ADMIN'])` middleware on `PATCH /inquiries/:id/status` — a 403 is returned even if someone bypasses the UI. The frontend hides the controls for agents as a UX convenience, but the server is the single source of truth.

---

### B. Server-Enforced State Machine

**Decision:** Status transitions are validated against an `ALLOWED_TRANSITIONS` map in the API, not just validated by type.

```
NEW        → [IN_PROGRESS, RESOLVED]
IN_PROGRESS → [RESOLVED, NEW]
RESOLVED   → [IN_PROGRESS]   // reopen allowed; not NEW directly
```

**Reasoning:** Without explicit transition rules, the UI could be manipulated or stale to request nonsensical jumps (e.g., RESOLVED → NEW). Returning `400 INVALID_STATUS_TRANSITION` with a descriptive message makes failures predictable and supports the stale-data scenario described in the assessment.

---

### C. Dual-Layer Validation (Zod + HTML5)

**Decision:** Both client-side HTML5 required attributes and server-side Zod schema validation are active simultaneously.

**Reasoning:**
1. **Client-side** validation (HTML5 `required`) provides instant feedback with no network round-trip — good UX for obvious empty-field errors.
2. **Server-side** Zod schemas validate data integrity independently, protecting against direct API calls, browser dev-tool bypasses, or any non-UI client.

---

### D. ORM Selection (Prisma + Neon PostgreSQL)

**Decision:** Prisma ORM over raw `pg` driver.

**Reasoning:** Prisma provides type-safe query building, schema migration management (`prisma migrate`), and readable seed scripts — all important for a time-constrained assessment where schema changes are inevitable during development.

---

## 3. Trade-off Accepted: Stale Data Handling

**Scenario (Assessment Situation 2):** Two browser tabs open the same inquiry. Tab A changes status; Tab B still shows the old state and then tries to update.

**Chosen approach:** Optimistic UI with API-conflict fallback.
- Tab B's PATCH request hits the transition guard and returns `400 INVALID_STATUS_TRANSITION`.
- The frontend catches this, shows an inline error message (e.g., *"Status update rejected: Cannot transition from RESOLVED to IN_PROGRESS"*), and automatically re-fetches the current state from the API to resync the view.

**Trade-off accepted:** No real-time push (WebSockets / SSE). This is acceptable for an internal tool with low concurrent-edit frequency. The re-fetch-on-error pattern keeps the UI eventually consistent without adding WebSocket infrastructure.

---

## 4. Usability States Designed

All of the following states are explicitly handled in the UI:

| State | Handling |
|---|---|
| Loading | Animated spinner with descriptive text |
| Empty list | Illustrated empty state with direct "Create Inquiry" action |
| Form validation error | Inline error banner from server response; HTML5 prevents obvious blanks |
| Status update rejected | Inline alert + auto-refetch to resync |
| 401 / session expired | Axios interceptor clears token and redirects to `/login` |
| 404 inquiry | Error card with link back to inquiries list |
| 403 forbidden | Error card with "not authorized" message |

---

## 5. AI Tooling & Technical Transparency

AI assistance was used for scaffolding boilerplate UI layouts, test setup templates, and reviewing code structure.

- **Accepted suggestion:** Using Zod schemas for server-side payload validation.
- **Modified suggestion:** Initial AI output allowed unrestricted status string updates. This was changed to enforce the `ALLOWED_TRANSITIONS` map and the `requireRole` middleware to preserve business process integrity.

---

## 6. What I Would Improve Next

1. **Audit log table** — An `InquiryHistory` table tracking who changed what and when, visible in the inquiry detail view as a timeline.
2. **Pagination** — The inquiry list currently loads all records. Adding cursor-based pagination would be necessary at scale.
3. **Real-time updates** — Server-Sent Events (SSE) to push new inquiries and status changes to all connected clients without polling.
4. **Agent assignment** — Allow admins to explicitly assign an inquiry to a specific agent, supporting accountability tracking.