# Margin

Margin is an independent, AI-assisted blog journal. Readers can discover and search stories by category; writers can register, publish and edit posts, upload a cover image, and ask the writing assistant for a continuation.

## Project structure

- `client/` — React, Vite, React Router, and SCSS frontend
- `api/` — Express API, MySQL access, JWT cookie authentication, Cloudinary uploads, and Groq writing suggestions

## Run locally

Use Node.js and npm. Configure the environment variables below before starting the API.

```bash
# Terminal 1: API
cd api
npm install
npm start

# Terminal 2: frontend
cd client
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:8800`.

## Environment configuration

Set API secrets and database details in `api/.env` for local development, or in the Render service environment. Do not commit real credentials.

| Variable | Used for |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Aiven MySQL connection |
| `JWT_SECRET_KEY` | Signing and verifying login sessions; use a long, random secret |
| `FRONTEND_URL` | Allowed frontend origin for credentialed CORS; defaults to the deployed Vercel origin |
| `GROQ_API_KEY` | Optional AI writing suggestions |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cover image uploads |
| `PORT` | API port; Render supplies this in deployment |

For local API development, set `NODE_ENV=development` so the session cookie uses local HTTP-compatible attributes. The hosted Render API uses HTTPS and cross-site secure cookies for the Vercel frontend.

In Vercel, set `VITE_API_URL` to the Render API base URL ending in `/api` (for example, `https://your-service.onrender.com/api`). Rebuild/redeploy after changing this build-time variable.

## Quality checks

```bash
cd client
npm run lint
npm run build
```

The database should contain `users` and `posts` tables. Posts are associated with their author through `posts.uid`; this app does not automatically create or migrate the Aiven schema.
