from datetime import datetime

from pydantic import BaseModel


class UploadResponse(BaseModel):
    short_id: str
    url: str
    original_filename: str
    expires_at: datetime | None
    file_count: int = 1


class FileInfoResponse(BaseModel):
    short_id: str
    original_filename: str
    content_type: str
    file_size: int
    requires_password: bool
    is_expired: bool
    is_access_exhausted: bool
    created_at: datetime
    expires_at: datetime | None


class AccessRequest(BaseModel):
    password: str | None = None
