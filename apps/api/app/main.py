import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlmodel import Session

from app.shared.config import settings
from app.shared.database import engine
from app.shared.limiter import limiter
from app.routers.files import router as files_router
from app.services.file_service import FileService
from app.services.storage import LocalStorage

logger = logging.getLogger(__name__)


async def cleanup_expired_files() -> None:
    while True:
        await asyncio.sleep(settings.CLEANUP_INTERVAL_SECONDS)
        try:
            with Session(engine) as session:
                service = FileService(session, LocalStorage())
                count = service.cleanup_expired()
                if count > 0:
                    logger.info("Cleaned up %d expired file(s)", count)
        except Exception:
            logger.exception("Error during expired file cleanup")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    task = asyncio.create_task(cleanup_expired_files())
    yield
    task.cancel()


app = FastAPI(title="Warp", version="0.1.0", lifespan=lifespan)

app.state.limiter = limiter


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"},
    )


app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router, prefix="/api/files", tags=["files"])
