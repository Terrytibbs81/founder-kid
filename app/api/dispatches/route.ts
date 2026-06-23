import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { userGet, userSet } from "../../../lib/kv-user";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dispatches = (await userGet(session.userId, "dispatches")) || [];
  return NextResponse.json(dispatches);
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, body } = await request.json();
  const dispatches = (await userGet(session.userId, "dispatches")) || [];
  const newDispatch = {
    id: Date.now().toString(),
    title,
    body,
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  };
  dispatches.push(newDispatch);
  await userSet(session.userId, "dispatches", dispatches);
  return NextResponse.json({ success: true, dispatch: newDispatch });
}

export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const dispatches = (await userGet(session.userId, "dispatches")) || [];
  await userSet(session.userId, "dispatches", dispatches.filter((d: { id: string }) => d.id !== id));
  return NextResponse.json({ success: true });
}
