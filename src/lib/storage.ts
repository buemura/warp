import { randomUUID } from "crypto";

function bucket(): string {
  return process.env.BLOB_BUCKET ?? "warp-files";
}

let bucketReady: Promise<void> | null = null;

function blobUrl(path: string): string {
  const base = process.env.BLOB_STORAGE_URL!.replace(/\/+$/, "");
  return `${base}${path}`;
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${process.env.BLOB_API_TOKEN!}` };
}

function objectUrl(key: string): string {
  return blobUrl(`/v1/buckets/${bucket()}/objects/${encodeURIComponent(key)}`);
}

async function errorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error ?? `${res.status} ${res.statusText}`;
}

function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const res = await fetch(blobUrl("/v1/buckets"), {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: bucket() }),
      });
      if (!res.ok && res.status !== 409) {
        throw new Error(`Bucket creation failed: ${await errorMessage(res)}`);
      }
    })().catch((err) => {
      bucketReady = null;
      throw err;
    });
  }
  return bucketReady;
}

export async function uploadToStorage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  await ensureBucket();
  const storedFilename = `${randomUUID().replace(/-/g, "")}_${filename}`;
  const res = await fetch(objectUrl(storedFilename), {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": contentType },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${await errorMessage(res)}`);
  return storedFilename;
}

export async function downloadFromStorage(
  storedFilename: string
): Promise<ArrayBuffer> {
  const res = await fetch(objectUrl(storedFilename), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Storage download failed: ${await errorMessage(res)}`);
  return res.arrayBuffer();
}

export async function deleteFromStorage(storedFilename: string): Promise<void> {
  const res = await fetch(objectUrl(storedFilename), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Storage delete failed: ${await errorMessage(res)}`);
  }
}
