# Warp

Warp is a secure temporary file storage service. Upload files and get short, shareable links with optional password protection, one-time access limits, and automatic expiration.

## Features

- **Drag & drop file upload** with a clean, responsive UI
- **Password protection** — optionally require a password to access the file
- **One-time access** — link works only once, then becomes inaccessible
- **TTL expiration** — set an expiry time (5min to 24h) after which the link stops working
- **Short shareable links** — unique 8-character IDs (like a URL shortener)
- **Copy to clipboard** — one-click link sharing

## Tech Stack

### Backend (`apps/api`)
- **Python 3.12+** with **FastAPI**
- **SQLModel** (SQLAlchemy + Pydantic) with **PostgreSQL**
- **Alembic** for database migrations
- **bcrypt** for password hashing
- **nanoid** for short ID generation
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
warp/
├── apps/
│   ├── api/                    # Backend (FastAPI)
│   │   ├── app/
│   │   │   ├── main.py         # App entrypoint
│   │   │   ├── config.py       # Settings
│   │   │   ├── database.py     # DB engine & session
│   │   │   ├── models.py       # FileMetadata model
│   │   │   ├── schemas.py      # Request/response schemas
│   │   │   ├── routers/        # API endpoints
│   │   │   ├── services/       # Business logic & storage
│   │   │   └── utils/          # Password hashing
│   │   └── tests/              # Backend tests
│   └── web/                    # Frontend (React + Vite)
│       ├── src/
│       │   ├── routes/         # TanStack Router pages
│       │   ├── components/     # React components
│       │   └── lib/            # API client
│       └── tests/              # Frontend tests
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- pnpm
- PostgreSQL

### Backend

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Run database migrations
alembic upgrade head

# Run the server
uvicorn app.main:app --reload
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
pytest -v
```

### Frontend tests

```bash
cd apps/web
pnpm test
```

## Database Migrations

Migrations are managed with Alembic. From the `apps/api` directory:

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration after changing models
alembic revision --autogenerate -m "description of change"

# Rollback one migration
alembic downgrade -1
```

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
