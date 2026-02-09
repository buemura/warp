const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface UploadResponse {
  short_id: string;
  url: string;
  original_filename: string;
  expires_at: string | null;
}

export interface FileInfoResponse {
  short_id: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  requires_password: boolean;
  is_expired: boolean;
  is_access_exhausted: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface UploadOptions {
  password?: string;
  oneTime?: boolean;
  ttlMinutes?: number;
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (options.password) {
    formData.append("password", options.password);
  }
  if (options.oneTime) {
    formData.append("one_time", "true");
  }
  if (options.ttlMinutes !== undefined) {
    formData.append("ttl_minutes", String(options.ttlMinutes));
  }

  const response = await fetch(`${API_BASE}/api/files/upload`, {
    method: "POST",
    body: formData,
  });

  if (response.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail ?? "Upload failed");
  }

  return response.json();
}

export async function getFileInfo(shortId: string): Promise<FileInfoResponse> {
  const response = await fetch(`${API_BASE}/api/files/${shortId}`);

  if (response.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "File not found" }));
    throw new Error(error.detail ?? "File not found");
  }

  return response.json();
}

export async function accessFile(
  shortId: string,
  password?: string,
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/api/files/${shortId}/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: password ?? null }),
  });

  if (response.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Access denied" }));
    throw new Error(error.detail ?? "Access denied");
  }

  return response.blob();
}
