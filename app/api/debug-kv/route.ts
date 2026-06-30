import { NextResponse } from "next/server";
import { kvGet, kvSet } from "../../../lib/kv";

export async function GET() {
  const testKey = "magictoken:debugtest123";
  const testValue = { email: "test@test.com", expires: Date.now() + 9999999 };

  // Write
  await kvSet(testKey, testValue);

  // Read back
  const result = await kvGet(testKey);

  return NextResponse.json({
    wrote: testValue,
    read: result,
    match: result?.email === testValue.email,
    kvUrl: process.env.KV_REST_API_URL ? "set" : "MISSING",
    kvToken: process.env.KV_REST_API_TOKEN ? "set" : "MISSING",
  });
}
