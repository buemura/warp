export const dynamic = "force-dynamic";

import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { insertFileMetadata } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { uploadToStorage } from "@/lib/storage";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE ?? 52_428_800);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const password = formData.get("password") as string | null;
  const oneTime = formData.get("one_time") === "true";
  const ttlMinutesRaw = formData.get("ttl_minutes");
  const ttlMinutes = ttlMinutesRaw ? Number(ttlMinutesRaw) : null;

  if (!files || files.length === 0) {
    return NextResponse.json({ detail: "No files provided." }, { status: 422 });
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_FILE_SIZE) {
    return NextResponse.json({ detail: "Total file size too large." }, { status: 413 });
  }

  if (ttlMinutes !== null && (ttlMinutes < 5 || ttlMinutes > 1440)) {
    return NextResponse.json(
      { detail: "TTL must be between 5 and 1440 minutes." },
      { status: 422 }
    );
  }

  const expiresAt =
    ttlMinutes !== null
      ? new Date(Date.now() + ttlMinutes * 60 * 1000)
      : null;

  const passwordHash = password ? await hashPassword(password) : null;
  const shortId = nanoid(8).replace(/[^0-9a-zA-Z]/g, () =>
    ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  );
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;

  let storedFilename: string;
  let originalFilename: string;
  let contentType: string;
  let fileSize: number;
  let fileCount: number;

  try {
    if (files.length === 1) {
      const file = files[0];
      const buffer = Buffer.from(await file.arrayBuffer());
      originalFilename = file.name || "unknown";
      contentType = file.type || "application/octet-stream";
      fileSize = buffer.length;
      fileCount = 1;
      storedFilename = await uploadToStorage(buffer, originalFilename, contentType);
    } else {
      const zip = new JSZip();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        zip.file(file.name || "unknown", bytes);
      }
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      fileCount = files.length;
      originalFilename = `warp-bundle-${fileCount}-files.zip`;
      contentType = "application/zip";
      fileSize = zipBuffer.length;
      storedFilename = await uploadToStorage(
        Buffer.from(zipBuffer),
        originalFilename,
        contentType
      );
    }
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ detail: "Upload failed." }, { status: 500 });
  }

  try {
    const metadata = await insertFileMetadata({
      short_id: shortId,
      original_filename: originalFilename,
      stored_filename: storedFilename,
      content_type: contentType,
      file_size: fileSize,
      password_hash: passwordHash,
      max_access_count: oneTime ? 1 : null,
      expires_at: expiresAt,
      ip_address: ip,
    });

    return NextResponse.json({
      short_id: metadata.short_id,
      url: `/${metadata.short_id}`,
      original_filename: metadata.original_filename,
      expires_at: metadata.expires_at,
      file_count: fileCount,
    });
  } catch (err) {
    console.error("DB insert error:", err);
    return NextResponse.json({ detail: "Failed to save file metadata." }, { status: 500 });
  }
}
