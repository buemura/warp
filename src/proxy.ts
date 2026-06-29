import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest, NextResponse } from "next/server";

function createLimiters() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  const redis = Redis.fromEnv();
  return {
    upload: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "warp:upload",
    }),
    info: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "warp:info",
    }),
    access: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "warp:access",
    }),
  };
}

const limiters = createLimiters();

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1"
  );
}

export async function proxy(req: NextRequest) {
  if (!limiters) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const m = req.method;

  let limiter: Ratelimit | null = null;
  if (pathname === "/api/files/upload" && m === "POST") {
    limiter = limiters.upload;
  } else if (/^\/api\/files\/[^/]+$/.test(pathname) && m === "GET") {
    limiter = limiters.info;
  } else if (/^\/api\/files\/[^/]+\/access$/.test(pathname) && m === "POST") {
    limiter = limiters.access;
  }

  if (!limiter) return NextResponse.next();

  const ip = getIP(req);
  const { success } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { detail: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/files/:path*"],
};
