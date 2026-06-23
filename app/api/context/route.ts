import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { userGet, userSet } from "../../../lib/kv-user";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const entries = (await userGet(session.userId, "context")) || [];
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { body } = await request.json();
  if (!body?.trim()) return NextResponse.json({ error: "Body required" }, { status: 400 });
  const entries = (await userGet(session.userId, "context")) || [];
  const entry = {
    id: Date.now().toString(),
    body: body.trim(),
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    timestamp: Date.now(),
  };
  entries.push(entry);
  await userSet(session.userId, "context", entries);
  return NextResponse.json({ success: true, entry });
}

export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const entries = (await userGet(session.userId, "context")) || [];
  await userSet(session.userId, "context", entries.filter((e: { id: string }) => e.id !== id));
  return NextResponse.json({ success: true });
}
