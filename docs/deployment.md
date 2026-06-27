# Deployment

The frontend is a static SPA — host it anywhere. The backend is optional.

## Static hosting (frontend only)

```bash
cd frontend
npm run build
# output: frontend/dist/frontend/browser/
```

Deploy `dist/frontend/browser/` to any static host:

- **Netlify / Vercel / Cloudflare Pages** — point the build to `frontend/`,
  build command `npm run build`, publish dir `dist/frontend/browser`.
- **GitHub Pages** — push the `browser/` folder; set a SPA 404 fallback.
- **S3 + CloudFront** — upload and configure the SPA fallback to `index.html`.

> **SPA fallback is required**: all unknown routes must serve `index.html`
> (handled automatically by the provided `nginx.conf`).

## Docker (frontend only)

```bash
cd frontend
docker build -t systemdesign-frontend .
docker run -p 8080:80 systemdesign-frontend
```

## Full stack with Docker Compose

Runs frontend (nginx) + backend (Spring Boot) + PostgreSQL:

```bash
docker compose up --build
# frontend → http://localhost:8081
# backend  → http://localhost:8080/api/designs
```

The frontend's nginx proxies `/api/` to the backend service.

## Backend only

```bash
cd backend
mvn clean package
java -jar target/backend-1.0.0.jar                       # dev (H2)
SPRING_PROFILES_ACTIVE=prod \
  DATABASE_URL=jdbc:postgresql://host:5432/systemdesign \
  DATABASE_USERNAME=... DATABASE_PASSWORD=... \
  java -jar target/backend-1.0.0.jar                     # prod (Postgres)
```

Health check: `GET /actuator/health`.

## Connecting the frontend to the backend

By default the frontend serves bundled content. To use the API, implement an
`ApiContentSource` (HTTP) implementing the `ContentSource` interface, provide it
in `app.config.ts`, and set `apiBaseUrl` in `core/config/app-config.ts`. No UI
changes are required.
