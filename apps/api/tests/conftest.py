import tempfile
from collections.abc import Generator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from starlette.testclient import TestClient

from app.shared.database import get_session
from app.main import app
from app.services.storage import LocalStorage


@pytest.fixture(name="tmp_upload_dir")
def tmp_upload_dir_fixture() -> Generator[str, None, None]:
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session, tmp_upload_dir: str) -> Generator[TestClient, None, None]:
    def get_session_override() -> Generator[Session, None, None]:
        yield session

    app.dependency_overrides[get_session] = get_session_override

    original_init = LocalStorage.__init__

    def patched_init(self: LocalStorage, upload_dir: str | None = None) -> None:
        original_init(self, upload_dir=tmp_upload_dir)

    LocalStorage.__init__ = patched_init  # type: ignore[method-assign]

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
    LocalStorage.__init__ = original_init  # type: ignore[method-assign]
