# Browser Agent Test App

A deterministic, vendor-neutral web application for developing and testing browser automation. It provides stable selectors, predictable APIs, file downloads and uploads, authentication flows, pagination, modals, dynamic content, and controlled failure scenarios.

This repository contains only synthetic test data and generic automation fixtures. It is not intended for production deployment.

## Quick start

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install both the frontend and backend dependencies:

```sh
npm run setup
```

Start the frontend and backend together:

```sh
npm run dev:all
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Backend health: `http://localhost:3001/api/health`

In another terminal, verify the complete setup:

```sh
npm run smoke
```

The smoke test waits for both services and verifies a real in-memory multipart upload, including filename, MIME type, byte count, and SHA-256 digest.

## Cursor Cloud Agent setup

The repository includes `.cursor/environment.json`. A Cursor Cloud Agent can install and start it without interactive setup:

```sh
npm run setup
npm run dev:all
npm run smoke
```

When this repository is a dependency in a multi-repository Cloud Agent environment, start it from this repository's root and wait for the health endpoints before running browser tests. The application does not require external services, third-party credentials, or persistent storage.

Recommended agent verification sequence:

1. Run `npm run check` to lint and build both applications.
2. Run `npm run dev:all` as a long-lived process.
3. Run `npm run smoke` from another terminal.
4. Use a local Chromium browser against `http://localhost:5173`.
5. Capture the JSON result shown by the target scenario as the test assertion.

If a browser runs outside the same machine, expose ports 5173 and 3001 through the environment's supported port-forwarding mechanism and set `VITE_API_BASE_URL` when building or starting the frontend.

## File upload scenarios

Open `http://localhost:5173/uploads`.

| Scenario | Input or target selector | Submit selector | Result selector |
| --- | --- | --- | --- |
| Download then upload | `#roundtrip-file-download`, then `#roundtrip-file-input` | `#roundtrip-file-submit` | `#roundtrip-file-result` |
| Visible native input | `#visible-file-input` | `#visible-file-submit` | `#visible-file-result` |
| Button-triggered chooser | `#hidden-file-trigger` | `#hidden-file-submit` | `#hidden-file-result` |
| Multiple native files | `#multiple-file-input` | `#multiple-file-submit` | `#multiple-file-result` |
| Drag-and-drop | `#file-drop-zone` | `#dropzone-file-submit` | `#dropzone-file-result` |

Upload endpoints:

- `GET /api/downloads/upload-fixture` — deterministic `upload-round-trip.csv` fixture
- `POST /api/uploads/single` — one file in the `file` multipart field
- `POST /api/uploads/multiple` — up to ten files in the `files` multipart field
- `GET /api/uploads/health` — upload service readiness and limits

Uploaded bytes are held in memory only and discarded after the response. Each response includes:

```json
{
  "success": true,
  "files": [
    {
      "fieldName": "file",
      "originalName": "example.txt",
      "mimeType": "text/plain",
      "size": 12,
      "sha256": "..."
    }
  ]
}
```

The upload limit is 25 MiB per file and ten files per request.

## Other test surfaces

- `/login` and `/register` — authentication and validation
- `/forms` — text fields, selects, radios, checkboxes, and validation
- `/interactions` — disabled, delayed, animated, and stateful controls
- `/data-tables` — filtering, sorting, pagination, and row actions
- `/downloads` — CSV, JSON, PDF, slow, large, and unreliable downloads
- `/download-lists` — repeated and data-dependent downloads
- `/api-testing` — request capture and offset/cursor/link pagination APIs
- `/modals` — dialogs and overlays
- `/dropdowns` — native and custom selection controls
- `/responsive` — viewport-dependent layouts
- `/heuristics` — ambiguous and self-healing selector targets
- `/monitoring` — long-running state and authentication-loss scenarios
- `/font-stress` — font-loading and screenshot stress scenarios

## Test accounts

The local SQLite database is initialized and seeded by `npm run setup`. The Cursor start command also reseeds it before launching the services, so every agent begins with the documented accounts. Run `npm run init-db` to restore them manually.

| Role | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `admin123` |
| Standard user | `testuser` | `user123` |

These credentials are deliberately public and local-only.

## Commands

```sh
npm run setup       # Install dependencies and seed the local database
npm run dev:all     # Start Vite and the Express backend
npm run smoke       # Verify frontend, backend, and multipart upload
npm run check       # Lint and build frontend and backend
npm run build:all   # Build frontend and backend
npm run init-db     # Recreate the local test users
```

## Architecture

```text
browser-agent-test-app/
├── src/                  React frontend and scenario pages
├── backend/src/          Express API, authentication, and fixtures
├── scripts/              Environment verification scripts
└── .cursor/              Cursor Cloud Agent environment configuration
```

The frontend and backend intentionally use separate ports so automation can exercise navigation, CORS, network waits, downloads, and multipart form submission.

## Safety and scope

- Do not deploy this application as a public production service.
- Uploads are memory-only and are not persisted.
- Authentication uses synthetic users and a local-only default signing key.
- Request-capture endpoints may echo request headers and bodies; use synthetic values only.
- Do not add customer data, proprietary fixtures, production credentials, or private service URLs.
