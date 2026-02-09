# Warp

Warp is a secure temporary file storage service. Upload files and get short, shareable links with optional password protection, one-time access limits, and automatic expiration.

## Features

- **Drag & drop file upload** with a clean, responsive UI
- **Password protection** — optionally require a password to access the file
- **One-time access** — link works only once, then becomes inaccessible
- **TTL expiration** — set an expiry time (5min to 24h) after which the link stops working
- **Short shareable links** — unique 8-character IDs (like a URL shortener)
- **Copy to clipboard** — one-click link sharing
- **Rate limiting** — IP-based rate limits to prevent abuse (configurable per endpoint)
- **IP tracking** — uploader IP address is stored with file metadata

## Tech Stack

### Backend (`apps/api`)
- **Python 3.12+** with **FastAPI**
- **SQLModel** (SQLAlchemy + Pydantic) with **PostgreSQL**
- **Alembic** for database migrations
- **bcrypt** for password hashing
- **nanoid** for short ID generation
- **slowapi** for IP-based rate limiting
- **pytest** for testing

### Frontend (`apps/web`)
- **React 19** with **TypeScript**
- **Vite** build tool
- **TanStack Router** (file-based routing)
- **TailwindCSS v4**
- **react-dropzone** for drag & drop
- **Vitest** + **React Testing Library** for testing

## Project Structure

```
├── docker-compose.yml         # PostgreSQL service
├── apps/
│   ├── api/                   # Backend (FastAPI)
│   │   ├── app/
│   │   │   ├── main.py        # App entrypoint
│   │   │   ├── models.py      # FileMetadata model
│   │   │   ├── schemas.py     # Request/response schemas
│   │   │   ├── routers/       # API endpoints
│   │   │   ├── services/      # Business logic & storage
│   │   │   └── shared/        # Config, database & security
│   │   ├── alembic/           # Database migrations
│   │   ├── tests/             # Backend tests
│   │   └── Makefile           # Dev commands
│   └── web/                   # Frontend (React + Vite)
│       ├── src/
│       │   ├── routes/        # TanStack Router pages
│       │   ├── components/    # React components
│       │   └── lib/           # API client
│       └── tests/             # Frontend tests
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- pnpm
- Docker (for PostgreSQL)

### Database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on port 5432 with database `warp`.

### Backend

```bash
cd apps/api
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Run database migrations
make migrate

# Run the server
make dev
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd apps/web
pnpm install

# Run the dev server
pnpm dev
```

The app will be available at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend.

## Running Tests

### Backend tests

```bash
cd apps/api
source .venv/bin/activate
make test
```

### Frontend tests

```bash
cd apps/web
pnpm test
```

## Environment Variables

### Backend (`apps/api/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/warp` | PostgreSQL connection string |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded files |
| `MAX_FILE_SIZE` | `52428800` | Max upload size in bytes (50 MB) |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend origin for CORS |
| `RATE_LIMIT_UPLOAD` | `5/minute` | Rate limit for file uploads |
| `RATE_LIMIT_FILE_INFO` | `30/minute` | Rate limit for file info requests |
| `RATE_LIMIT_ACCESS` | `10/minute` | Rate limit for file downloads |
| `RATE_LIMIT_DEFAULT` | `60/minute` | Default rate limit for all endpoints |
| `RATE_LIMIT_ENABLED` | `true` | Enable/disable rate limiting |

## Makefile Commands

From the `apps/api` directory:

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies |
| `make dev` | Start dev server with auto-reload |
| `make test` | Run tests |
| `make migrate` | Apply all pending migrations |
| `make migrate-create` | Create a new migration |
| `make migrate-down` | Rollback one migration |
| `make migrate-reset` | Reset all migrations |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/files/upload` | Upload a file (multipart form) |
| `GET` | `/api/files/{short_id}` | Get file metadata |
| `POST` | `/api/files/{short_id}/access` | Download file (validates password/access) |

### Upload parameters (form data)

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The file to upload (required) |
| `password` | string | Password to protect the file (optional) |
| `one_time` | boolean | If true, link works only once (optional) |
| `ttl_minutes` | integer | Minutes until the link expires (optional) |
