import io
from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select
from starlette.testclient import TestClient

from app.models import FileMetadata


def _upload_file(
    client: TestClient,
    content: bytes = b"test content",
    filename: str = "test.txt",
    password: str | None = None,
    one_time: bool = False,
    ttl_minutes: int | None = None,
) -> dict:
    data: dict[str, str] = {}
    if password:
        data["password"] = password
    if one_time:
        data["one_time"] = "true"
    if ttl_minutes is not None:
        data["ttl_minutes"] = str(ttl_minutes)

    response = client.post(
        "/api/files/upload",
        files={"file": (filename, io.BytesIO(content), "text/plain")},
        data=data,
    )
    assert response.status_code == 200
    return response.json()


def test_access_file(client: TestClient) -> None:
    upload = _upload_file(client)
    short_id = upload["short_id"]

    response = client.post(f"/api/files/{short_id}/access")
    assert response.status_code == 200
    assert response.content == b"test content"


def test_get_file_info(client: TestClient) -> None:
    upload = _upload_file(client)
    short_id = upload["short_id"]

    response = client.get(f"/api/files/{short_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["short_id"] == short_id
    assert data["original_filename"] == "test.txt"
    assert data["requires_password"] is False
    assert data["is_expired"] is False
    assert data["is_access_exhausted"] is False


def test_file_not_found(client: TestClient) -> None:
    response = client.get("/api/files/nonexistent")
    assert response.status_code == 404

    response = client.post("/api/files/nonexistent/access")
    assert response.status_code == 404


def test_access_with_correct_password(client: TestClient) -> None:
    upload = _upload_file(client, password="secret123")
    short_id = upload["short_id"]

    response = client.post(
        f"/api/files/{short_id}/access",
        json={"password": "secret123"},
    )
    assert response.status_code == 200
    assert response.content == b"test content"


def test_access_with_wrong_password(client: TestClient) -> None:
    upload = _upload_file(client, password="secret123")
    short_id = upload["short_id"]

    response = client.post(
        f"/api/files/{short_id}/access",
        json={"password": "wrongpassword"},
    )
    assert response.status_code == 403


def test_access_without_password_when_required(client: TestClient) -> None:
    upload = _upload_file(client, password="secret123")
    short_id = upload["short_id"]

    response = client.post(f"/api/files/{short_id}/access")
    assert response.status_code == 403


def test_one_time_access_second_attempt_fails(client: TestClient) -> None:
    upload = _upload_file(client, one_time=True)
    short_id = upload["short_id"]

    response = client.post(f"/api/files/{short_id}/access")
    assert response.status_code == 200

    response = client.post(f"/api/files/{short_id}/access")
    assert response.status_code == 410


def test_file_info_shows_access_exhausted(client: TestClient) -> None:
    upload = _upload_file(client, one_time=True)
    short_id = upload["short_id"]

    client.post(f"/api/files/{short_id}/access")

    response = client.get(f"/api/files/{short_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["is_access_exhausted"] is True


def test_expired_ttl_access(client: TestClient, session: Session) -> None:
    upload = _upload_file(client, ttl_minutes=60)
    short_id = upload["short_id"]

    metadata = session.exec(select(FileMetadata).where(FileMetadata.short_id == short_id)).first()
    assert metadata is not None
    metadata.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    session.add(metadata)
    session.commit()

    response = client.post(f"/api/files/{short_id}/access")
    assert response.status_code == 410


def test_file_info_shows_expired(client: TestClient, session: Session) -> None:
    upload = _upload_file(client, ttl_minutes=60)
    short_id = upload["short_id"]

    metadata = session.exec(select(FileMetadata).where(FileMetadata.short_id == short_id)).first()
    assert metadata is not None
    metadata.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    session.add(metadata)
    session.commit()

    response = client.get(f"/api/files/{short_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["is_expired"] is True
