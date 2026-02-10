from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class FileMetadata(SQLModel, table=True):
    __tablename__ = "file_metadata"

    id: int | None = Field(default=None, primary_key=True)
    short_id: str = Field(unique=True, index=True)
    original_filename: str
    stored_filename: str
    content_type: str
    file_size: int
    password_hash: str | None = Field(default=None)
    max_access_count: int | None = Field(default=None)
    access_count: int = Field(default=0)
    expires_at: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: str | None = Field(default=None)
    removed_at: datetime | None = Field(default=None)
