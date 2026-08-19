# Alethia web

Full-stack contest implementation of Alethia — a company knowledge-readiness workspace.

## Client-ready workspace

- `/login` provides individual client authentication with hashed passwords, expiring server-side sessions, tenant identity and division scope.
- `/onboarding` creates the company, organization administrator, allowed divisions, people, access roles, functional roles and login credentials.
- `/demo` preserves the fast guided persona walkthrough as a separate experience.

The local showcase account is `admin@alethia.demo` / `Welcome123!`. Engineering manager and developer accounts use `engineering.manager@alethia.demo` and `developer@alethia.demo` with the same local-only password.

Organization administrators see the company. Division managers see only their division's people, documents, campaigns and results. Members see personal work plus allowed company/division knowledge. New companies receive tour-ready Engineering, Legal, Support and Operations documentation with verification packs, allowing campaign creation and completion immediately.

Persistence remains self-contained in `data/alethia.json` for the offline competition build. The server-only storage boundary keeps a later Postgres adapter migration isolated from UI/workflow code. Set a strong `AUTH_SECRET` in production.

## Included

- competition-facing impact dashboard with an interactive five-scene product tour
- dedicated product-pitch story covering the problem, flow, accountability hierarchy, solution and measurable outcome
- Motion-powered spring entrances, tour transitions and tactile role/card interactions with reduced-motion support
- role-based demo login portal and cookie-protected workspace separation
- responsive ClickUp-inspired backoffice shell
- Home, My Work, Documents, Impact Analysis, Assistant, People, Campaigns, Risk, Analytics, Governance, Enterprise Admin, Integrations and Settings
- command palette (`⌘K` / `Ctrl+K`), Manager/Employee/Developer/Legal workspaces, collapsible navigation and light/dark themes
- campaign creation and scenario-based verification flow
- manager document upload for PDF, DOCX and text formats; live AI analysis; department/role/person targeting; notifications; generated verification; and persisted results
- five-step guided tour, citations, audit activity and reduced-motion support
- permission-aware grounded retrieval with explicit insufficient-evidence behavior
- JSON persistence, API-enforced demo RBAC, connector sync, governance and enterprise APIs

All included company content is fictional demo data. Runtime state persists locally in `data/alethia.json`. Document analysis and knowledge-test generation call the configured Sumopod OpenAI-compatible endpoint using the fixed `deepseek-v4-flash` model. The API key remains server-only. Production deployment should replace demo authentication and JSON storage with an identity provider and PostgreSQL/pgvector while retaining the current API contracts.

## Getting started

```bash
npm install
cp .env.example .env.local
# Set SUMOPOD_API_KEY in .env.local
npm run dev
```

For cross-origin deployments, configure `ALLOWED_ORIGINS` as a comma-separated
list of full HTTPS origins. `ALLOWED_DEV_ORIGINS` accepts comma-separated hostnames
used only by the Next.js development server. Production also requires a strong,
unique `AUTH_SECRET`; the server refuses to sign authentication context without it.
Set `ENABLE_DEMO_MODE=true` only for the competition showcase. When omitted from
a production environment, demo cookies and `X-Demo-Role` headers are rejected.

Open [http://localhost:3000](http://localhost:3000) for the competition showcase. Use `/login` to choose a fictional demo persona; authenticated sessions enter the protected `/workspace` route.

Run the complete quality gate with:

```bash
npm run verify
```

## Deploying on Emergent

Alethia is a single full-stack Next.js application. It must be imported at the
Emergent workspace root so that `package.json`, `app/`, `components/`, and
`lib/` exist directly under `/app` (not `/app/web`).

1. In a new or empty Emergent task, choose **GitHub → Pull from GitHub**.
2. Select `neojarma/alethia` and the `main` branch.
3. Confirm `/app/package.json` and `/app/app/api/health/route.ts` exist.
4. Run Preview and the pre-deployment health check before clicking Deploy.
5. Add the values from `.env.example` through Emergent's secret/environment
   variable manager. Never put a real API key or production `AUTH_SECRET` in
   a committed `.env` file.

The tracked `backend/.env` is intentionally empty. It is only a compatibility
placeholder for deployment jobs that probe for a split backend even though all
Alethia server routes live in `app/api`.
