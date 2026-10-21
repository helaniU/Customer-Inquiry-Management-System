# Architectural Decisions & Technical Analysis
**Project:** Customer Inquiry Management System  
**Organization:** Coffee Ninja (Pvt) Ltd  

---

## 1. Core Assumptions
* **Target Audience:** Internal cafe staff (agents and managers) working in a fast-paced environment.
* **Authentication Model:** Workspace personnel use pre-provisioned accounts. Registration is disabled to maintain secure internal access control.
* **Data Flow:** Inquiries follow a unidirectional life-cycle transition under normal operational workflows (`NEW` -> `IN_PROGRESS` -> `RESOLVED`), with explicit permission to reopen resolved items for customer follow-ups.

---

## 2. Key Design Decisions

### A. Server-Enforced State Machine & Access Control
Instead of relying on frontend visual state guards, all status transition rules and record authorization checks are strictly validated in the Express API middleware. Invalid status changes (e.g., setting unrecognized status tags) return `400 Bad Request` with structured error messages.

### B. Validation Strategy (Zod + Client Feedbacks)
Dual-layer validation is enforced:
1. **Client-side:** Instant HTML5 input validation prevents unnecessary network overhead for empty/malformed inputs.
2. **Server-side:** Zod schemas validate data integrity at the HTTP entry point to defend against bypass attempts.

### C. ORM Selection (Prisma + Neon PostgreSQL)
Prisma ORM was selected over raw SQL driver implementations to ensure strict type safety, predictable query execution, and seamless schema migrations across environments.

---

## 3. Trade-off Analysis: Handling Stale Data (Situation 2)
* **Accepted Trade-off:** Optimistic UI state updates with explicit API conflict fallback were selected over full WebSocket/Polling real-time synchronization.
* **Reasoning:** Implementing WebSockets adds setup complexity and resource footprint for an internal workspace with moderate concurrency.
* **User Experience:** When two staff members open the same inquiry simultaneously and Tab A updates the status, Tab B's subsequent update attempt receives an `INVALID_STATUS_TRANSITION` error from the API. The UI captures this exception, displays a alert toast notification, and automatically triggers an API refetch to synchronize Tab B's view with the backend state.

---

## 4. AI Tooling & Technical Transparency
AI assistance was utilized for boilerplate UI component layout generation and automated test setup templates.
* **Accepted Suggestion:** Utilizing Zod schemas for backend request payload validation.
* **Modified Suggestion:** Initial AI outputs suggested allowing unrestricted arbitrary status string updates; this was modified to enforce strict transition rules (`ALLOWED_TRANSITIONS` map) to protect business process integrity.

---

## 5. Future Engineering Improvements
1. **Audit Logs:** Add an `inquiry_history` timeline table to track exact staff timestamps and commentary for status changes.
2. **Real-time Notifications:** Integrate Server-Sent Events (SSE) to update dashboard overview cards dynamically when new inquiries are submitted.