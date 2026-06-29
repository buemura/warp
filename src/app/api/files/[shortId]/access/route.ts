export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getFileMetadata, recordAccess, validateAccess } from "@/lib/db";
import { downloadFromStorage } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const metadata = await getFileMetadata(shortId);

  if (!metadata) {
    return NextResponse.json({ detail: "File not found." }, { status: 404 });
  }

  let password: string | null = null;
  try {
    const body = await req.json();
    password = body?.password ?? null;
  } catch {
    // body is optional
  }

  const result = await validateAccess(metadata, password);
  if (!result.ok) {
    return NextResponse.json({ detail: result.error }, { status: result.status ?? 403 });
  }

  try {
    const buffer = await downloadFromStorage(metadata.stored_filename);
    await recordAccess(metadata);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": metadata.content_type,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(metadata.original_filename)}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ detail: "Failed to retrieve file." }, { status: 500 });
  }
}
