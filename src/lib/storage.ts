import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "./supabase";

const BUCKET = "warp-files";

async function ensureBucket() {
  const supabase = getSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: false });
  }
}

export async function uploadToStorage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  await ensureBucket();
  const storedFilename = `${randomUUID().replace(/-/g, "")}_${filename}`;
  const { error } = await getSupabaseAdmin().storage
    .from(BUCKET)
    .upload(storedFilename, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return storedFilename;
}

export async function downloadFromStorage(
  storedFilename: string
): Promise<ArrayBuffer> {
  const { data, error } = await getSupabaseAdmin().storage
    .from(BUCKET)
    .download(storedFilename);
  if (error || !data) throw new Error(`Storage download failed: ${error?.message}`);
  return data.arrayBuffer();
}

export async function deleteFromStorage(storedFilename: string): Promise<void> {
  const { error } = await getSupabaseAdmin().storage
    .from(BUCKET)
    .remove([storedFilename]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}
