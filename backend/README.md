# Emergent compatibility backend

Emergent supervises a backend process on port 8001 and a frontend process on
port 3000. Alethia's application APIs remain implemented by Next.js under
`frontend/app/api`; this FastAPI service provides the required backend process
and transparently forwards `/api/*` requests to that internal Next.js server.

`/api/health` forwards Alethia's full health response when the frontend is
available and returns a limited startup response while it is booting.
Production environment values belong in Emergent's secret manager.
