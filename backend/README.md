# Backend compatibility directory

Alethia is a single Next.js application. Server functionality lives under
`app/api`, so there is no independently deployed backend or MongoDB service.

The empty `.env` file exists only because some deployment orchestrators require
`backend/.env` while preparing their build context. Runtime variables must be
configured in the hosting platform's secret manager.
