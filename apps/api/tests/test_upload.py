import io

from starlette.testclient import TestClient


def test_upload_file(client: TestClient) -> None:
    file = io.BytesIO(b"hello world")
    response = client.post(
        "/api/files/upload",
        files={"file": ("test.txt", file, "text/plain")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "short_id" in data
    assert data["original_filename"] == "test.txt"
    assert data["url"].startswith("/")
    assert data["expires_at"] is None


def test_upload_file_with_password(client: TestClient) -> None:
    file = io.BytesIO(b"secret content")
    response = client.post(
        "/api/files/upload",
        files={"file": ("secret.txt", file, "text/plain")},
        data={"password": "mypassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "short_id" in data


def test_upload_file_with_one_time(client: TestClient) -> None:
    file = io.BytesIO(b"one time content")
    response = client.post(
        "/api/files/upload",
        files={"file": ("once.txt", file, "text/plain")},
        data={"one_time": "true"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "short_id" in data


def test_upload_file_with_ttl(client: TestClient) -> None:
    file = io.BytesIO(b"expiring content")
    response = client.post(
        "/api/files/upload",
        files={"file": ("ttl.txt", file, "text/plain")},
        data={"ttl_minutes": "60"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["expires_at"] is not None
