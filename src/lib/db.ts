import { and, or, isNotNull, isNull, lte, gte, eq } from "drizzle-orm";
import { getDb } from "./drizzle";
import { fileMetadata } from "./schema";
import type { FileMetadata } from "@/types";
import { verifyPassword } from "./security";

export async function getFileMetadata(shortId: string): Promise<FileMetadata | null> {
  const rows = await getDb()
    .select()
    .from(fileMetadata)
    .where(eq(fileMetadata.short_id, shortId))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertFileMetadata(
  record: Omit<FileMetadata, "id" | "created_at" | "access_count" | "removed_at">
): Promise<FileMetadata> {
  const rows = await getDb()
    .insert(fileMetadata)
    .values({ ...record, access_count: 0 })
    .returning();
  if (!rows[0]) throw new Error("DB insert failed");
  return rows[0];
}

export async function recordAccess(metadata: FileMetadata): Promise<void> {
  await getDb()
    .update(fileMetadata)
    .set({ access_count: metadata.access_count + 1 })
    .where(eq(fileMetadata.id, metadata.id));
}

export async function getExpiredFiles(): Promise<FileMetadata[]> {
  return getDb()
    .select()
    .from(fileMetadata)
    .where(
      and(
        isNull(fileMetadata.removed_at),
        or(
          and(
            isNotNull(fileMetadata.expires_at),
            lte(fileMetadata.expires_at, new Date())
          ),
          and(
            isNotNull(fileMetadata.max_access_count),
            gte(fileMetadata.access_count, fileMetadata.max_access_count)
          )
        )
      )
    );
}

export async function markFileRemoved(id: number): Promise<void> {
  await getDb()
    .update(fileMetadata)
    .set({ removed_at: new Date() })
    .where(eq(fileMetadata.id, id));
}

export interface AccessValidationResult {
  ok: boolean;
  error?: string;
  status?: number;
}

export async function validateAccess(
  metadata: FileMetadata,
  password?: string | null
): Promise<AccessValidationResult> {
  if (metadata.expires_at !== null) {
    if (new Date() > metadata.expires_at) {
      return { ok: false, error: "This file has expired.", status: 410 };
    }
  }

  if (
    metadata.max_access_count !== null &&
    metadata.access_count >= metadata.max_access_count
  ) {
    return { ok: false, error: "This file is no longer accessible.", status: 410 };
  }

  if (metadata.password_hash !== null) {
    if (!password) {
      return { ok: false, error: "Password is required.", status: 403 };
    }
    const valid = await verifyPassword(password, metadata.password_hash);
    if (!valid) {
      return { ok: false, error: "Incorrect password.", status: 403 };
    }
  }

  return { ok: true };
}
