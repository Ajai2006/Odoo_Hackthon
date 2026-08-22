# Dayflow HRMS — Audio Presentation Script
**Odoo Hackathon 2026 | Target Runtime: 7–8 Minutes (~1,080 words)**

---

## SECTION 1 — OPENING HOOK
*[0:00 – 0:45]*

Here's something your current HR system probably does silently: if an employee clicks
"Check In" twice in the same day, nothing stops it. The record just overwrites. No flag,
no audit trail, no rejection.

Dayflow rejects that second request with a **409 Conflict** — enforced at the API layer,
logged immediately, and visible in the admin monitor within the same second. That's not a
UI trick. That's the server refusing to allow data corruption at the source.

That one detail — a 409 instead of a silent overwrite — captures what this entire project is
about: **precision over approximation**, at every layer.

My name is [Name], and I built Dayflow HRMS — a full-stack, production-grade human resource
and attendance platform built specifically for Odoo Hackathon 2026.

---

## SECTION 2 — THE PROBLEM
*[0:45 – 1:30]*

Most HR tools fail in one of three ways.

First, they treat attendance as a simple toggle — present or absent — ignoring half-days,
late arrivals, overtime, and the grey zones that make real shift management hard.

Second, they separate leave management from attendance records. An approved holiday stays
in a spreadsheet while the attendance system still marks the employee absent. Someone has
to manually reconcile them. Usually, nobody does.

Third, they give every user the same view. An admin sees what an employee should never
see. A manager can't filter to just their team. Privacy and scoping aren't afterthoughts —
they're architecturally missing.

Dayflow was built to fix all three.

---

## SECTION 3 — ARCHITECTURE
*[1:30 – 2:30]*

The stack is a deliberate two-service split, and I want to address the design choice
directly before it becomes a question.

The **Express + Node.js backend** handles all real-time operations — shift clocking,
live attendance monitoring, JWT authentication, and the workforce risk engine. These
need low-latency responses; a shift check-in should not wait for an ORM query planner.

The **React 18 + Vite frontend** connects to this backend via a strict CORS policy, with
JWT tokens stored exclusively in `httpOnly` cookies — never accessible to JavaScript,
never exposed to XSS attacks.

The database is **SQLite with WAL mode** — Write-Ahead Logging — which allows concurrent
reads without blocking writes, making it appropriate for a multi-user real-time attendance
system even in a single-file database.

Security is baked in at the infrastructure level: Helmet headers on every response,
parameterized queries throughout (verified by three dedicated SQL injection test suites),
and an account lockout that triggers after five consecutive failed login attempts.

This is not a demo stack. Every architectural decision maps to a specific threat or
real-world operational requirement.

---

## SECTION 4 — LIVE FEATURE WALKTHROUGH
*[2:30 – 4:30]*

Let me walk through the system as a user would experience it.

**Login.** The portal includes an HTML5 Canvas-rendered captcha — distorted characters
with background noise lines, generated fresh on each load. No external captcha service.
No API dependency. The entire auth flow, from credential submission to JWT issuance, runs
in under 200 milliseconds as measured in our test suite.

**Shift Clocking.** The Check In button triggers a server-side timestamp — the client
clock is explicitly ignored. An employee cannot backdate a check-in. Admins can override
this with a debug flag for testing purposes, but that flag is blocked on non-admin tokens.
The live elapsed shift timer updates every second on the employee dashboard.

**Leave Management.** When a manager approves a leave request, Dayflow does not simply
mark the request as "approved" and stop. It automatically converts every matching
attendance calendar date to `Leave` status — atomically, in the same database transaction.
The employee's record is always consistent. No manual reconciliation step exists.

**Role-Tailored Analytics.** When an employee opens their analytics view, they see their
personal shift logs — their own check-in times, their own punctuality record, their own
hours against the 40-hour weekly target. They do not see department breakdowns. They do
not see other staff's attendance. The data scoping is enforced at the API query level, not
just hidden in the UI.

When a manager or admin opens analytics, the view switches entirely — department
performance breakdowns, six-week attendance trend tables, AI workforce recommendations,
and a one-click export to a multi-section CSV report containing individual employee
shift-by-shift analysis, department summaries, and historical trend data.

**Offline AI Assistant.** A compact floating AI widget is available on every page —
no external API, no API key, no rate limit. It evaluates real application context: the
user's role, today's punch status, punctuality metrics. Ask it about attendance risk,
leave conflicts, or weekly targets and it responds in under half a second, entirely
client-side.

---

## SECTION 5 — TECHNICAL PROOF POINTS
*[4:30 – 5:30]*

The claims I've made are testable. Here is the evidence.

**Security:** Twenty-one automated test suites run on every push via GitHub Actions — on
Node 20 and Node 22 in parallel. Three of those suites specifically test SQL injection
resistance: login endpoint payloads, search parameter injection, and department filter
injection. All 21 suites pass. Zero failures.

**Audit trail:** Every leave approval captures the reviewing manager's ID, their comment,
and a timestamp — stored in the `leave_requests` table alongside the decision. A reason
is required on every update. There is no anonymous approval path.

**Scale readiness:** The database is pre-seeded with 20 realistic staff personas across
seven departments — HR & People, Engineering, Design, Sales, Finance, Marketing, and
Operations — each with 28 days of historical attendance logs and leave history. The
analytics engine runs correctly across this full dataset without hardcoded assumptions.

**Real-time:** The workforce risk engine evaluates Monday/Friday absence spikes, sick
leave surges, and overlapping leave clusters in real time, per department, surfacing
`LOW`, `MEDIUM`, or `HIGH` risk classifications with specific anomaly indicators.

---

## SECTION 6 — WHAT'S PRODUCTION-READY TODAY
*[5:30 – 6:30]*

Dayflow ships with:

- A GitHub Actions CI pipeline that automatically runs all 21 test suites on every pull
  request before any code reaches main.
- A fully documented `.env.example` at both root and server level, listing every
  environment variable required to deploy, with inline explanations.
- A `npm run seed` command that rebuilds the full database — schema, users, employees,
  leave balances, and 28 days of attendance history — in under three seconds.
- A `npm run dev` command that concurrently starts the Express backend on port 5000 and
  the Vite frontend on port 3000, with no manual coordination required.

A new developer can clone this repository, run four commands, and have the full system
running locally — with realistic data — in under five minutes.

---

## SECTION 7 — CLOSING & Q&A INVITATION
*[6:30 – 7:30]*

Dayflow HRMS is the system HR teams actually need: one where a late clock-in is detected
automatically, a leave approval is reflected immediately across the attendance calendar,
and an employee's data stays their own — all enforced at the infrastructure level, not
patched on top of it.

**Dayflow does not approximate HR management — it enforces it.**

This build was designed to meet the three criteria that separate a hackathon winner from
a prototype: completeness across the full HR workflow, technical depth at the security
and data layer, and real-world deployability from a single clone-and-run command.

I'm happy to walk through any part of the codebase, run the test suite live, or open the
GitHub Actions dashboard to show the CI results. What would you like to see first?

---

*[END — ~1,080 words | Runtime: 7–8 minutes at natural speaking pace]*
