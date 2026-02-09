import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.shared.config import settings


class LocalStorage:
    def __init__(self, upload_dir: str | None = None) -> None:
        self.upload_dir = Path(upload_dir or settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save(self, file: UploadFile) -> str:
        stored_filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = self.upload_dir / stored_filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return stored_filename

    def get_path(self, stored_filename: str) -> Path:
        return self.upload_dir / stored_filename

    def delete(self, stored_filename: str) -> None:
        file_path = self.upload_dir / stored_filename
        if file_path.exists():
            file_path.unlink()
