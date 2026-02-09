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


def test_upload_file_with_ttl_below_minimum(client: TestClient) -> None:
    file = io.BytesIO(b"content")
    response = client.post(
        "/api/files/upload",
        files={"file": ("ttl.txt", file, "text/plain")},
        data={"ttl_minutes": "4"},
    )
    assert response.status_code == 422
    assert "TTL must be between 5 and 1440 minutes" in response.json()["detail"]


def test_upload_file_with_ttl_above_maximum(client: TestClient) -> None:
    file = io.BytesIO(b"content")
    response = client.post(
        "/api/files/upload",
        files={"file": ("ttl.txt", file, "text/plain")},
        data={"ttl_minutes": "1441"},
    )
    assert response.status_code == 422
    assert "TTL must be between 5 and 1440 minutes" in response.json()["detail"]


def test_upload_file_with_ttl_at_boundaries(client: TestClient) -> None:
    file = io.BytesIO(b"content")
    response = client.post(
        "/api/files/upload",
        files={"file": ("min.txt", file, "text/plain")},
        data={"ttl_minutes": "5"},
    )
    assert response.status_code == 200

    file = io.BytesIO(b"content")
    response = client.post(
        "/api/files/upload",
        files={"file": ("max.txt", file, "text/plain")},
        data={"ttl_minutes": "1440"},
    )
    assert response.status_code == 200
