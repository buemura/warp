from fastapi import APIRouter, Depends, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import Session

from app.shared.config import settings
from app.shared.database import get_session
from app.shared.limiter import limiter
from app.schemas import AccessRequest, FileInfoResponse, UploadResponse
from app.services.file_service import FileService
from app.services.storage import LocalStorage

router = APIRouter()


def get_file_service(session: Session = Depends(get_session)) -> FileService:
    storage = LocalStorage()
    return FileService(session=session, storage=storage)


@router.post("/upload", response_model=UploadResponse)
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
def upload_file(
    request: Request,
    file: UploadFile,
    password: str | None = Form(None),
    one_time: bool = Form(False),
    ttl_minutes: int | None = Form(None),
    service: FileService = Depends(get_file_service),
) -> UploadResponse:
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large.")

    metadata = service.upload(
        file=file,
        password=password,
        one_time=one_time,
        ttl_minutes=ttl_minutes,
        ip_address=request.client.host if request.client else None,
    )

    return UploadResponse(
        short_id=metadata.short_id,
        url=f"/{metadata.short_id}",
        original_filename=metadata.original_filename,
        expires_at=metadata.expires_at,
    )


@router.get("/{short_id}", response_model=FileInfoResponse)
@limiter.limit(settings.RATE_LIMIT_FILE_INFO)
def get_file_info(
    request: Request,
    short_id: str,
    service: FileService = Depends(get_file_service),
) -> FileInfoResponse:
    metadata = service.get_metadata(short_id)
    if metadata is None:
        raise HTTPException(status_code=404, detail="File not found.")

    is_expired = False
    is_access_exhausted = False

    ok, error_msg = service.validate_access(metadata, password=None)
    if not ok:
        if "expired" in error_msg.lower():
            is_expired = True
        elif "no longer accessible" in error_msg.lower():
            is_access_exhausted = True

    return FileInfoResponse(
        short_id=metadata.short_id,
        original_filename=metadata.original_filename,
        content_type=metadata.content_type,
        file_size=metadata.file_size,
        requires_password=metadata.password_hash is not None,
        is_expired=is_expired,
        is_access_exhausted=is_access_exhausted,
        created_at=metadata.created_at,
        expires_at=metadata.expires_at,
    )


@router.post("/{short_id}/access")
@limiter.limit(settings.RATE_LIMIT_ACCESS)
def access_file(
    request: Request,
    short_id: str,
    body: AccessRequest | None = None,
    service: FileService = Depends(get_file_service),
) -> FileResponse:
    metadata = service.get_metadata(short_id)
    if metadata is None:
        raise HTTPException(status_code=404, detail="File not found.")

    password = body.password if body else None
    ok, error_msg = service.validate_access(metadata, password=password)
    if not ok:
        if "password" in error_msg.lower():
            raise HTTPException(status_code=403, detail=error_msg)
        raise HTTPException(status_code=410, detail=error_msg)

    service.record_access(metadata)

    file_path = service.get_file_path(metadata)
    return FileResponse(
        path=str(file_path),
        filename=metadata.original_filename,
        media_type=metadata.content_type,
    )
