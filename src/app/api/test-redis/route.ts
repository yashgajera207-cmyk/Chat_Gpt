import { NextResponse } from "next/server";

import { redis } from "@/lib/redis";

export async function GET() {

  await redis.set(
    "message",
    "Redis Working"
  );

  const value =
    await redis.get("message");

  return NextResponse.json({
    success: true,
    value,
  });
}