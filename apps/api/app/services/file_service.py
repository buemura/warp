from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import UploadFile
from nanoid import generate
from sqlmodel import Session, select

from app.models import FileMetadata
from app.services.storage import LocalStorage
from app.shared.security import hash_password, verify_password
from app.schemas import UploadResponse

SHORT_ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
SHORT_ID_SIZE = 8


class FileService:
    def __init__(self, session: Session, storage: LocalStorage) -> None:
        self.session = session
        self.storage = storage

    def upload(
        self,
        file: UploadFile,
        password: str | None = None,
        one_time: bool = False,
        ttl_minutes: int | None = None,
        ip_address: str | None = None,
    ) -> UploadResponse:
        stored_filename = self.storage.save(file)
        file_path = self.storage.get_path(stored_filename)
        file_size = file_path.stat().st_size

        expires_at = None
        if ttl_minutes is not None:
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)

        metadata = FileMetadata(
            short_id=generate(SHORT_ID_ALPHABET, SHORT_ID_SIZE),
            original_filename=file.filename or "unknown",
            stored_filename=stored_filename,
            content_type=file.content_type or "application/octet-stream",
            file_size=file_size,
            password_hash=hash_password(password) if password else None,
            max_access_count=1 if one_time else None,
            expires_at=expires_at,
            ip_address=ip_address,
        )

        self.session.add(metadata)
        self.session.commit()
        self.session.refresh(metadata)

        return UploadResponse(
            short_id=metadata.short_id,
            url=f"/{metadata.short_id}",
            original_filename=metadata.original_filename,
            expires_at=metadata.expires_at,
        )

    def get_metadata(self, short_id: str) -> FileMetadata | None:
        statement = select(FileMetadata).where(FileMetadata.short_id == short_id)
        return self.session.exec(statement).first()

    def validate_access(
        self, metadata: FileMetadata, password: str | None = None
    ) -> tuple[bool, str]:
        if metadata.expires_at is not None:
            expires_at = metadata.expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > expires_at:
                return False, "This file has expired."

        if (
            metadata.max_access_count is not None
            and metadata.access_count >= metadata.max_access_count
        ):
            return False, "This file is no longer accessible."

        if metadata.password_hash is not None:
            if password is None:
                return False, "Password is required."
            if not verify_password(password, metadata.password_hash):
                return False, "Incorrect password."

        return True, ""

    def record_access(self, metadata: FileMetadata) -> None:
        metadata.access_count += 1
        self.session.add(metadata)
        self.session.commit()

    def get_file_path(self, metadata: FileMetadata) -> Path:
        return self.storage.get_path(metadata.stored_filename)

    def cleanup_expired(self) -> int:
        now = datetime.now(timezone.utc)
        statement = select(FileMetadata).where(
            FileMetadata.expires_at.isnot(None),  # type: ignore[union-attr]
            FileMetadata.expires_at <= now,  # type: ignore[operator]
            FileMetadata.removed_at.is_(None),  # type: ignore[union-attr]
        )
        expired_files = self.session.exec(statement).all()

        count = 0
        for metadata in expired_files:
            self.storage.delete(metadata.stored_filename)
            metadata.removed_at = now
            self.session.add(metadata)
            count += 1

        if count > 0:
            self.session.commit()

        return count
