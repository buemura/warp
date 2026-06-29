export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getFileMetadata, validateAccess } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const metadata = await getFileMetadata(shortId);

  if (!metadata) {
    return NextResponse.json({ detail: "File not found." }, { status: 404 });
  }

  const result = await validateAccess(metadata, null);

  let isExpired = false;
  let isAccessExhausted = false;

  if (!result.ok) {
    if (result.error?.includes("expired")) isExpired = true;
    else if (result.error?.includes("no longer accessible")) isAccessExhausted = true;
  }

  return NextResponse.json({
    short_id: metadata.short_id,
    original_filename: metadata.original_filename,
    content_type: metadata.content_type,
    file_size: metadata.file_size,
    requires_password: metadata.password_hash !== null,
    is_expired: isExpired,
    is_access_exhausted: isAccessExhausted,
    created_at: metadata.created_at,
    expires_at: metadata.expires_at,
  });
}
