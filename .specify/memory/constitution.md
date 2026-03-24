<!--
  SYNC IMPACT REPORT
  ==================
  Version change: [unversioned template] → 1.0.0
  Modified principles: N/A (initial ratification — all sections newly authored)
  Added sections: Core Principles (I–V), Tech Stack Constraints, Development Workflow, Governance
  Removed sections: N/A
  Templates reviewed:
    ✅ .specify/templates/plan-template.md — Constitution Check section is generic; aligns with principles
    ✅ .specify/templates/spec-template.md — Scope/requirements format is compatible; no changes needed
    ✅ .specify/templates/tasks-template.md — Task phases and dependency model align with Principle III (simplicity)
    ✅ .specify/templates/agent-file-template.md — Generic template; no agent-specific naming issues
  Deferred TODOs: None
-->

# WatchTonight Constitution

## Core Principles

### I. Content-First UX

Every UI component MUST serve content discovery and browsing. Features that do not directly
improve how users find or access movies and TV shows MUST be rejected or deferred. Visual
additions (animations, decorative elements, layout changes) MUST be validated against whether
they clarify or obscure content presentation. When in doubt, remove rather than add.

**Rationale**: WatchTonight's sole purpose is helping users discover what to watch tonight.
Scope creep into general-purpose media features dilutes that mission.

### II. Static-Site Architecture

The app is a purely static site hosted on GitHub Pages. No server-side logic, dynamic routing,
or runtime API calls to external services are permitted in the browser. All data MUST be
pre-processed at build time and served as static JSON files under `public/data/`. Build scripts
under `scripts/` are the only permitted location for data-processing logic.

**Rationale**: A static architecture eliminates hosting costs, removes operational complexity,
and guarantees availability. Any change that introduces a runtime server dependency violates
this principle.

### III. Component Simplicity (YAGNI)

Components MUST be kept minimal, composable, and single-purpose. Abstraction is only justified
when identical logic appears in three or more independent places. shadcn/ui primitives (Dialog,
Card, Badge, Tabs, Tooltip) MUST be used before writing custom components. New dependencies
require explicit justification against existing capabilities in the stack.

**Rationale**: The codebase MUST remain approachable for solo maintenance. Over-engineering
components makes future updates harder and increases bundle size.

### IV. Data Currency

Content data (`movies.json`, `shows.json`) MUST remain current via automated update scripts
and the scheduled GitHub Actions workflows. Manual edits to data files on feature branches are
prohibited. Data pipeline scripts MUST be idempotent and re-runnable without side effects.
Any new data field added to a JSON file MUST be documented in the script that produces it.

**Rationale**: Stale content undermines the product's core value proposition. Automation
prevents drift and removes manual toil.

### V. Performance and SEO

The app MUST maintain full SEO coverage: Open Graph tags, Twitter cards, JSON-LD structured
data, sitemap.xml, and robots.txt. The sitemap date MUST be updated on every build (enforced
via `prebuild` script). No feature may regress Core Web Vitals (LCP, CLS, FID/INP) as
measured on a production build. Bundle analysis (`npm run analyze`) MUST be run before any
dependency addition that could materially increase bundle size.

**Rationale**: As a static marketing-adjacent site, organic discoverability and fast
Time-to-Interactive directly affect user acquisition and retention.

## Tech Stack Constraints

The following stack is fixed for this project. Introducing alternatives to any item requires
a constitution amendment:

- **Framework**: Vite + React 19
- **Styling**: Tailwind CSS 3 + shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Data sources**: TMDB, OMDb, Gemini (summaries) — accessed only from build scripts
- **Hosting**: GitHub Pages (static only, no server)
- **CI/CD**: GitHub Actions (build, deploy, scheduled data updates)
- **Language**: JavaScript (ES modules); no TypeScript migration without explicit decision

New runtime dependencies MUST NOT be added without confirming they do not conflict with the
static-site constraint and are compatible with the existing Vite + Tailwind + React build.

## Development Workflow

- Features are specified under `specs/[###-feature-name]/` following the speckit workflow
  (spec → plan → tasks).
- Every PR MUST pass `npm run build` cleanly before merge. Linting (`npm run lint`) MUST
  also pass.
- Data update commits (`chore: update * data`) are automated via GitHub Actions and MUST NOT
  be mixed with feature work on feature branches.
- The `main` branch is the deployment branch. Direct pushes to `main` are only permitted for
  automated data updates and hotfixes; all other changes go through PRs.
- Speckit feature branches follow the naming convention: `claude/[branch-name]` or
  `[###-feature-name]`.

## Governance

This constitution supersedes all other documented or undocumented development practices.
Where a conflict exists between this document and any other guide, this document prevails.

**Amendment procedure**:
1. Open a PR with the proposed change to this file.
2. Increment the version number following semantic versioning rules (see below).
3. Update `LAST_AMENDED_DATE` to the amendment date.
4. Update the Sync Impact Report comment at the top of this file.
5. Review and update any dependent templates in `.specify/templates/` as needed.
6. Merge only after confirming no active spec or plan is invalidated.

**Versioning policy**:
- MAJOR: Removal or redefinition of an existing principle in a backward-incompatible way.
- MINOR: New principle added, new section added, or materially expanded guidance.
- PATCH: Clarifications, wording fixes, typo corrections, non-semantic refinements.

**Compliance review**: All spec reviews (`/speckit.plan` Constitution Check gate) MUST verify
compliance with the active principles before proceeding to implementation.

**Version**: 1.0.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
