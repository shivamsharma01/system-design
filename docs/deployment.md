# Deployment

The app is a static SPA — host it anywhere. All learning content is bundled in
the frontend; there is no separate API server.

## Static hosting

```bash
cd frontend
npm run build
# output: frontend/dist/frontend/browser/
```

Deploy `dist/frontend/browser/` to any static host:

- **Netlify / Vercel / Cloudflare Pages** — point the build to `frontend/`,
  build command `npm run build`, publish dir `dist/frontend/browser`.
- **GitHub Pages** — push the `browser/` folder; set a SPA 404 fallback
  (this repo already deploys via `.github/workflows/deploy.yml`).
- **S3 + CloudFront** — upload and configure the SPA fallback to `index.html`.

> **SPA fallback is required**: all unknown routes must serve `index.html`
> (handled automatically by the provided `nginx.conf`).

## Docker

### Frontend image only

```bash
cd frontend
docker build -t systemdesign-frontend .
docker run -p 8080:80 systemdesign-frontend
```

### Docker Compose

```bash
docker compose up --build
# frontend → http://localhost:8081
```
