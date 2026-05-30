# CreatorSync

CreatorSync is a multi-platform content publishing assistant. This repository currently contains the backend service skeleton used as the unified API layer for future AI rewriting and simulated publishing capabilities.

## Backend

The backend lives in [`backend/`](backend/) and is an independent Express + TypeScript service.

### Requirements

* Node.js 18+
* npm

### Dependencies

Runtime dependencies:

* `express` - HTTP server framework
* `cors` - cross-origin request support
* `dotenv` - environment variable loading

Development dependencies:

* `typescript` - TypeScript compiler
* `ts-node-dev` - local TypeScript development server with restart support

### Environment variables

Copy the example file before local development:

```bash
cp backend/.env.example backend/.env
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3001` | Backend HTTP port. |
| `CORS_ORIGIN` | `*` | Allowed CORS origins. Use comma-separated values for multiple origins. |

### Local development

```bash
cd backend
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:3001/health
```

The service returns JSON with a unified response shape:

```json
{
  "success": true,
  "data": {
    "service": "CreatorSync Backend",
    "status": "ok",
    "uptime": 1.23
  },
  "message": "success",
  "timestamp": "2026-05-30T00:00:00.000Z"
}
```
