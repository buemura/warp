export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getExpiredFiles, markFileRemoved } from "@/lib/db";
import { deleteFromStorage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
    }
  }

  const expired = await getExpiredFiles();
  let count = 0;

  for (const file of expired) {
    try {
      await deleteFromStorage(file.stored_filename);
    } catch (err) {
      console.error(`Failed to delete storage file ${file.stored_filename}:`, err);
    }
    try {
      await markFileRemoved(file.id);
      count++;
    } catch (err) {
      console.error(`Failed to mark file ${file.id} as removed:`, err);
    }
  }

  return NextResponse.json({ cleaned: count });
}
